import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Set "mo:base/OrderedSet";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Map "mo:map/Map";

import Types "types";
import Utils "utils";

actor IC2FA {
  type ID = Types.ID;
  type SecretCreate = Types.SecretCreate;
  type SecretUpdate = Types.SecretUpdate;
  type Secret = Types.Secret;

  /* -------------------------------------------------------------------------- */
  /*                                   SECRETS                                  */
  /* -------------------------------------------------------------------------- */

  let secretSet = Set.Make<Secret>(func(a, b) = Int.compare(a.createdAt, b.createdAt));
  stable var userSecrets : Map.Map<Principal, Set.Set<Secret>> = Map.new();

  func findById(set : Set.Set<Secret>, id : ID) : ?Secret {
    for (secret in secretSet.vals(set)) {
      if (Text.equal(secret.id, id)) return ?secret;
    };
    null;
  };

  func findBySecretKey(set : Set.Set<Secret>, secretKey : Text) : ?Secret {
    for (secret in secretSet.vals(set)) {
      if (Text.equal(secret.secretKey, secretKey)) return ?secret;
    };
    null;
  };

  public query ({ caller }) func list() : async [Secret] {
    let ?set : ?Set.Set<Secret> = Map.get<Principal, Set.Set<Secret>>(userSecrets, Map.phash, caller) else return [];
    secretSet.vals(set) |> Iter.toArray(_);
  };

  public shared ({ caller }) func create(payload : SecretCreate) : async Result.Result<(), { #alreadyExists : ID }> {
    assert not Principal.isAnonymous(caller);

    var set = switch (Map.get(userSecrets, Map.phash, caller)) {
      case (?v) v;
      case null secretSet.empty();
    };

    switch (findBySecretKey(set, payload.secretKey)) {
      case (?{ id }) #err(#alreadyExists id);
      case null {
        let id : ID = await Utils.generateId();
        let createdAt = Time.now();
        let secret : Secret = {
          payload and { id; createdAt; updatedAt = createdAt }
        };
        set := secretSet.put(set, secret);
        Map.set(userSecrets, Map.phash, caller, set);
        #ok();
      };
    };
  };

  public shared ({ caller }) func update(payload : SecretUpdate) : async Result.Result<(), { #notFound }> {
    assert not Principal.isAnonymous(caller);

    let ?set = Map.get(userSecrets, Map.phash, caller) else return #err(#notFound);
    let ?found = findById(set, payload.id) else return #err(#notFound);
    var newSet = secretSet.delete(set, found);
    newSet := secretSet.put(set, { found with payload; updatedAt = Time.now() });
    Map.set(userSecrets, Map.phash, caller, newSet);

    #ok();
  };

  public shared ({ caller }) func delete(id : ID) : async Result.Result<(), { #notFound }> {
    assert not Principal.isAnonymous(caller);

    let ?set = Map.get(userSecrets, Map.phash, caller) else return #err(#notFound);
    let ?found = findById(set, id) else return #err(#notFound);
    let newSet = secretSet.delete(set, found);
    Map.set(userSecrets, Map.phash, caller, newSet);

    #ok();
  };

  /* -------------------------------------------------------------------------- */
  /*                              SYSTEM LIFECYCLE                              */
  /* -------------------------------------------------------------------------- */

  stable var stableUserSecrets : [(Principal, Set.Set<Secret>)] = [];

  system func preupgrade() {
    stableUserSecrets := Map.entries(userSecrets) |> Iter.toArray _;
  };

  system func postupgrade() {
    userSecrets := stableUserSecrets.vals() |> Map.fromIter(_, Map.phash);
    stableUserSecrets := [];
  };
};
