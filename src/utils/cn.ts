export type ClassValue = string | false | null | undefined | 0;

export const cn = (...classes: ClassValue[]) => classes.filter(Boolean).join(' ');
