/**
 * Utility to serialize JavaScript objects into Paradox Clausewitz script format.
 */

export type ClausewitzValue = string | number | boolean | ClausewitzObject | ClausewitzArray | undefined | null;

export interface ClausewitzObject {
  [key: string]: ClausewitzValue | ClausewitzValue[];
}

export type ClausewitzArray = (string | number)[];

export function serializeClausewitz(data: ClausewitzObject, indentLevel = 0): string {
  let result = '';
  const indent = '\t'.repeat(indentLevel);

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      // Es un array de objetos (teclas duplicadas, ej: multiples 'modifier') 
      // o un array de primitivos (lista separada por espacios, ej: 'add_ideas = { a b }')
      if (value.length > 0 && typeof value[0] === 'object') {
        for (const item of value) {
          result += `${indent}${key} = {\n`;
          result += serializeClausewitz(item as ClausewitzObject, indentLevel + 1);
          result += `${indent}}\n`;
        }
      } else if (value.length > 0) {
        result += `${indent}${key} = { ${value.join(' ')} }\n`;
      } else {
         // Array vacio
         result += `${indent}${key} = { }\n`;
      }
    } else if (typeof value === 'object') {
      if ('__raw' in value && typeof value.__raw === 'string') {
        // Inyección de código crudo
        const rawLines = value.__raw.split('\n');
        for (const line of rawLines) {
           result += `${indent}${line}\n`;
        }
      } else {
        // Objeto anidado
        result += `${indent}${key} = {\n`;
        result += serializeClausewitz(value as ClausewitzObject, indentLevel + 1);
        result += `${indent}}\n`;
      }
    } else if (typeof value === 'boolean') {
      // Los booleanos en HOI4 son 'yes' o 'no'
      result += `${indent}${key} = ${value ? 'yes' : 'no'}\n`;
    } else if (typeof value === 'string' && value.includes(' ')) {
       // Los strings con espacios deben ir entre comillas
       result += `${indent}${key} = "${value}"\n`;
    } else {
      // Primitivos simples (números, strings sin espacios)
      result += `${indent}${key} = ${value}\n`;
    }
  }

  return result;
}
