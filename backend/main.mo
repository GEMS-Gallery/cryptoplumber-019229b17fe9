import Nat "mo:base/Nat";
import Text "mo:base/Text";

import Array "mo:base/Array";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Order "mo:base/Order";

actor {
  stable var highScores : [(Text, Nat)] = [];

  public func addHighScore(name : Text, score : Nat) : async () {
    highScores := Array.sort<(Text, Nat)>(
      Array.append(highScores, [(name, score)]),
      func(a, b) {
        if (a.1 < b.1) { #greater }
        else if (a.1 > b.1) { #less }
        else { #equal }
      }
    );
    if (highScores.size() > 10) {
      highScores := Array.subArray(highScores, 0, 10);
    };
  };

  public query func getHighScores() : async [(Text, Nat)] {
    highScores
  };
}
