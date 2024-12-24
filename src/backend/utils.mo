import Int "mo:base/Int";
import Order "mo:base/Order";
import Text "mo:base/Text";
import Set "mo:map/Set";
import Prim "mo:prim";
import AsyncSource "mo:uuid/async/SourceV4";
import UUID "mo:uuid/UUID";

import Types "types";

module {
  type ID = Types.ID;
  type Secret = Types.Secret;

  public let secretHash : Set.HashUtils<Secret> = (func a = Set.hashText(a.id), func(a, b) = Text.equal(a.id, b.id));

  public func secretsCompare(s1 : Secret, s2 : Secret) : Order.Order {
    Int.compare(s1.createdAt, s2.createdAt);
  };

  public func generateId() : async ID {
    let ae = AsyncSource.Source();
    let id = await ae.new();
    Text.map(UUID.toText(id), Prim.charToLower);
  };
};
