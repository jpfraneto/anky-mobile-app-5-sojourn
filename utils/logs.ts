export const prettyLog = (obj: any, label?: string) => {
  const timestamp = new Date().toISOString();

  if (label) {
  } else {
  }

  try {
  } catch (err) {
    // Fallback for objects that can't be stringified
    console.dir(obj, { depth: null, colors: true });
  }

};
