export const idlFactory = ({ IDL }) => {
  const SecretCreate = IDL.Record({
    'otpType' : IDL.Variant({ 'hotp' : IDL.Null, 'totp' : IDL.Null }),
    'name' : IDL.Text,
    'secretKey' : IDL.Text,
  });
  const ID__1 = IDL.Text;
  const Result_1 = IDL.Variant({
    'ok' : IDL.Null,
    'err' : IDL.Variant({ 'alreadyExists' : ID__1 }),
  });
  const Result = IDL.Variant({
    'ok' : IDL.Null,
    'err' : IDL.Variant({ 'notFound' : IDL.Null }),
  });
  const ID = IDL.Text;
  const Time = IDL.Int;
  const Secret = IDL.Record({
    'id' : ID,
    'otpType' : IDL.Variant({ 'hotp' : IDL.Null, 'totp' : IDL.Null }),
    'name' : IDL.Text,
    'createdAt' : Time,
    'secretKey' : IDL.Text,
    'updatedAt' : Time,
  });
  const SecretUpdate = IDL.Record({
    'id' : ID,
    'otpType' : IDL.Variant({ 'hotp' : IDL.Null, 'totp' : IDL.Null }),
    'name' : IDL.Text,
    'secretKey' : IDL.Text,
  });
  return IDL.Service({
    'create' : IDL.Func([SecretCreate], [Result_1], []),
    'delete' : IDL.Func([ID__1], [Result], []),
    'list' : IDL.Func([], [IDL.Vec(Secret)], ['query']),
    'update' : IDL.Func([SecretUpdate], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
