type TemplateData = Record<string, unknown>;

export const template = (str: string, data: TemplateData): string => {
  return str.replace(/{{\s*([\w.]+)\s*}}/g, (_, path: string) => {
    const value = path.split('.').reduce<unknown>((obj, key) => {
      if (obj && typeof obj === 'object' && key in obj) {
        return (obj as Record<string, unknown>)[key];
      }
      return undefined;
    }, data);

    return value != null ? String(value) : '';
  });
};
