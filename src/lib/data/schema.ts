import { DataSchema, SchemaField, DataPreview } from '@/types';

/**
 * Detects the data type of a value
 */
export function detectFieldType(value: unknown): SchemaField['type'] {
  if (value === null || value === undefined) {
    return 'string'; // Default for null/undefined
  }

  if (typeof value === 'boolean') {
    return 'boolean';
  }

  if (typeof value === 'number') {
    return 'number';
  }

  if (typeof value === 'string') {
    // Try to detect if it's a date string - more restrictive pattern
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    if (dateRegex.test(value) && value.length <= 24) {
      const date = new Date(value);
      if (!isNaN(date.getTime()) && date.getFullYear() >= 1900 && date.getFullYear() <= 2100) {
        return 'date';
      }
    }
    return 'string';
  }

  if (Array.isArray(value)) {
    return 'array';
  }

  if (typeof value === 'object') {
    return 'object';
  }

  return 'string';
}

/**
 * Analyzes a dataset and generates a schema
 */
export function generateSchema(data: unknown[]): DataSchema {
  if (!data || data.length === 0) {
    return { fields: [] };
  }

  // Get all unique field names from the dataset
  const fieldNames = new Set<string>();
  const fieldTypes = new Map<string, Map<string, number>>();
  const fieldNullCounts = new Map<string, number>();

  data.forEach(row => {
    if (row && typeof row === 'object' && !Array.isArray(row)) {
      const record = row as Record<string, unknown>;
      
      Object.keys(record).forEach(fieldName => {
        fieldNames.add(fieldName);
        
        const value = record[fieldName];
        const isNull = value === null || value === undefined;
        
        // Track null counts
        if (isNull) {
          fieldNullCounts.set(fieldName, (fieldNullCounts.get(fieldName) || 0) + 1);
        }
        
        // Track type occurrences
        const type = detectFieldType(value);
        if (!fieldTypes.has(fieldName)) {
          fieldTypes.set(fieldName, new Map());
        }
        const typeMap = fieldTypes.get(fieldName)!;
        typeMap.set(type, (typeMap.get(type) || 0) + 1);
      });
    }
  });

  // Generate schema fields
  const fields: SchemaField[] = Array.from(fieldNames).map(fieldName => {
    const typeMap = fieldTypes.get(fieldName) || new Map();
    const nullCount = fieldNullCounts.get(fieldName) || 0;
    
    // Determine the most common type
    let mostCommonType: SchemaField['type'] = 'string';
    let maxCount = 0;
    
    typeMap.forEach((count, type) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonType = type;
      }
    });

    // Field is nullable if we found null values
    const nullable = nullCount > 0;

    return {
      name: fieldName,
      type: mostCommonType,
      nullable,
    };
  });

  return { fields };
}

/**
 * Creates a data preview from a dataset
 */
export function createDataPreview(
  data: unknown[], 
  maxSampleSize: number = 100,
  errors?: string[]
): DataPreview {
  const totalRows = data.length;
  const sample = data.slice(0, maxSampleSize);
  const schema = generateSchema(data);

  return {
    sample,
    totalRows,
    schema,
    errors,
  };
}

/**
 * Validates that data conforms to a schema
 */
export function validateDataAgainstSchema(data: unknown[], schema: DataSchema): string[] {
  const errors: string[] = [];

  if (!data || data.length === 0) {
    return errors;
  }

  data.forEach((row, rowIndex) => {
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      errors.push(`Row ${rowIndex}: Expected object, got ${typeof row}`);
      return;
    }

    const record = row as Record<string, unknown>;

    schema.fields.forEach(field => {
      const value = record[field.name];
      const isNull = value === null || value === undefined;

      // Check nullable constraint
      if (isNull && !field.nullable) {
        errors.push(`Row ${rowIndex}, Field '${field.name}': Cannot be null`);
        return;
      }

      // Skip type checking for null values
      if (isNull) {
        return;
      }

      // Check type compatibility
      const actualType = detectFieldType(value);
      if (actualType !== field.type) {
        errors.push(
          `Row ${rowIndex}, Field '${field.name}': Expected ${field.type}, got ${actualType}`
        );
      }
    });
  });

  return errors;
}

/**
 * Checks if two schemas are compatible for data flow
 */
export function schemasCompatible(sourceSchema: DataSchema, targetSchema: DataSchema): {
  compatible: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Create maps for easier lookup
  const sourceFields = new Map(sourceSchema.fields.map(f => [f.name, f]));
  const targetFields = new Map(targetSchema.fields.map(f => [f.name, f]));

  // Check if target schema requires fields not present in source
  targetFields.forEach((targetField, fieldName) => {
    const sourceField = sourceFields.get(fieldName);
    
    if (!sourceField) {
      if (!targetField.nullable) {
        issues.push(`Missing required field: ${fieldName}`);
      }
      return;
    }

    // Check type compatibility
    if (sourceField.type !== targetField.type) {
      // Some type conversions are acceptable
      const compatibleConversions = [
        ['number', 'string'],
        ['boolean', 'string'],
        ['date', 'string'],
      ];

      const isCompatible = compatibleConversions.some(
        ([from, to]) => sourceField.type === from && targetField.type === to
      );

      if (!isCompatible) {
        issues.push(
          `Type mismatch for field ${fieldName}: source is ${sourceField.type}, target expects ${targetField.type}`
        );
      }
    }

    // Check nullability
    if (sourceField.nullable && !targetField.nullable) {
      issues.push(
        `Nullability mismatch for field ${fieldName}: source allows null, target does not`
      );
    }
  });

  return {
    compatible: issues.length === 0,
    issues,
  };
}

/**
 * Merges two schemas, taking the union of fields
 */
export function mergeSchemas(schema1: DataSchema, schema2: DataSchema): DataSchema {
  const fieldMap = new Map<string, SchemaField>();

  // Add fields from first schema
  schema1.fields.forEach(field => {
    fieldMap.set(field.name, { ...field });
  });

  // Merge fields from second schema
  schema2.fields.forEach(field => {
    const existing = fieldMap.get(field.name);
    
    if (!existing) {
      fieldMap.set(field.name, { ...field });
    } else {
      // Merge field properties
      const merged: SchemaField = {
        name: field.name,
        type: existing.type === field.type ? field.type : 'string', // Default to string for conflicts
        nullable: existing.nullable || field.nullable, // Union of nullability
      };
      fieldMap.set(field.name, merged);
    }
  });

  return {
    fields: Array.from(fieldMap.values()),
  };
}