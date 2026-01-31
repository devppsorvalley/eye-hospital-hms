export const validateLogin = (body) => {
  if (!body.username || !body.password) throw new Error('Invalid login payload');
};
