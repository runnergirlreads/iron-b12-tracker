import { DEFAULT_LAB_TESTS } from '../constants/symptoms';
import { CustomLabTest, LabResult } from '../types';

export function isDefaultLabTest(name: string): boolean {
  return DEFAULT_LAB_TESTS.some((test) => test.name === name);
}

export function getDefaultLabTestNames(): string[] {
  return DEFAULT_LAB_TESTS.map((test) => test.name);
}

export function buildCustomLabTestNames(
  stored: CustomLabTest[],
  labs: LabResult[],
): string[] {
  const names = new Set<string>();
  for (const test of stored) {
    if (!isDefaultLabTest(test.name)) {
      names.add(test.name);
    }
  }
  for (const lab of labs) {
    if (!isDefaultLabTest(lab.testName)) {
      names.add(lab.testName);
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}

export function getLabTestPreset(
  name: string,
  stored: CustomLabTest[],
): { unit: string; refLow?: number; refHigh?: number } | undefined {
  const defaultTest = DEFAULT_LAB_TESTS.find((test) => test.name === name);
  if (defaultTest) {
    return {
      unit: defaultTest.unit,
      refLow: defaultTest.refLow,
      refHigh: defaultTest.refHigh,
    };
  }
  const custom = stored.find((test) => test.name === name);
  if (custom) {
    return {
      unit: custom.unit,
      refLow: custom.refLow,
      refHigh: custom.refHigh,
    };
  }
  return undefined;
}
