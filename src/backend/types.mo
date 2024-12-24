import Time "mo:base/Time";

module {
  public type ID = Text;

  public type SecretCreate = {
    name : Text;
    secretKey : Text;
    otpType : { #totp; #hotp };
  };

  public type SecretUpdate = SecretCreate and {
    id : ID;
  };

  public type Secret = SecretUpdate and {
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };
};
