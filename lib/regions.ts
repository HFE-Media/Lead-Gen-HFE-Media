export const REGION_OPTIONS = [
  { value: "za", label: "South Africa" },
  { value: "us", label: "United States" },
  { value: "gb", label: "United Kingdom" },
  { value: "au", label: "Australia" },
  { value: "ca", label: "Canada" },
  { value: "ae", label: "United Arab Emirates" },
  { value: "nz", label: "New Zealand" },
  { value: "sg", label: "Singapore" },
  { value: "ie", label: "Ireland" },
  { value: "in", label: "India" }
] as const;

export const DEFAULT_REGION = "za";

export function isSupportedRegion(value: string) {
  return REGION_OPTIONS.some((region) => region.value === value);
}

export function getRegionLabel(value: string) {
  return REGION_OPTIONS.find((region) => region.value === value)?.label ?? value.toUpperCase();
}
