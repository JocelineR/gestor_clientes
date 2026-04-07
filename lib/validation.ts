export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateClient(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.full_name?.trim()) {
    errors.push("full_name is required");
  }

  if (!data.email?.trim()) {
    errors.push("email is required");
  } else if (!validateEmail(data.email)) {
    errors.push("email must be valid");
  }

  if (!data.company?.trim()) {
    errors.push("company is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
