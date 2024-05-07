export interface Status {
  valid: boolean
  message?: string
}

type Rule = (value: string, label: string) => Status

export const required: Rule = (value: string, label: string = value): Status => {
  const result = Boolean(value)

  return {
    valid: result,
    message: result ? undefined : `${label} is required`
  }
}

export function length({ min, max }: { min: number, max: number }, label: string): Rule {
  return function (value: string): Status {
    const result = Boolean(value.length > min && value.length < max)

    return {
      valid: result,
      message: result ? undefined : `${label} must be between ${min} and ${max}`
    }
  }
}

export const email: Rule = (value: string, label: string = value): Status => {
  const regex = /^\w+@[a-zA-Z_0-9]+?\.[a-zA-Z]{2,6}$/
  const isValid = regex.test(value);
  return {
    valid: isValid,
    message: isValid ? undefined : `${label} is not valid`
  }

}

export function validate(value: string, rules: Rule[], label: string): Status {

  for (const rule of rules) {
    const result = rule(value, label)

    if (!result.valid) {
      return result
    }
  }

  return {
    valid: true
  }
}

export const validation = {
  email: (value: string, label: string) => { return email(value, label); },
  required: (value: string, label: string) => { return required(value, label); }
}