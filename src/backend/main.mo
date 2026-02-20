import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";

actor {
  let gameStates = Map.empty<Nat, GameState>();

  type GameState = {
    var health : Nat;
    var ammunition : Nat;
    var score : Nat;
    var enemiesDefeated : Nat;
  };

  public shared ({ caller }) func startGame(playerId : Nat) : async () {
    if (gameStates.containsKey(playerId)) {
      Runtime.trap("Game already started for player " # playerId.toText());
    };
    let initialState : GameState = {
      var health = 100;
      var ammunition = 50;
      var score = 0;
      var enemiesDefeated = 0;
    };
    gameStates.add(playerId, initialState);
  };

  public shared ({ caller }) func takeDamage(playerId : Nat, amount : Nat) : async () {
    switch (gameStates.get(playerId)) {
      case (?state) {
        if (state.health > amount) {
          state.health -= amount;
        } else {
          state.health := 0;
        };
      };
      case (null) { Runtime.trap("No game state for player " # playerId.toText()) };
    };
  };

  public shared ({ caller }) func rechargeWeapon(playerId : Nat, amount : Nat) : async () {
    switch (gameStates.get(playerId)) {
      case (?state) { state.ammunition += amount };
      case (null) { Runtime.trap("No game state for player " # playerId.toText()) };
    };
  };

  public shared ({ caller }) func increaseScore(playerId : Nat, points : Nat) : async () {
    switch (gameStates.get(playerId)) {
      case (?state) { state.score += points };
      case (null) { Runtime.trap("No game state for player " # playerId.toText()) };
    };
  };

  public shared ({ caller }) func defeatEnemy(playerId : Nat) : async () {
    switch (gameStates.get(playerId)) {
      case (?state) { state.enemiesDefeated += 1 };
      case (null) { Runtime.trap("No game state for player " # playerId.toText()) };
    };
  };

  public query ({ caller }) func getGameState(playerId : Nat) : async {
    health : Nat;
    ammunition : Nat;
    score : Nat;
    enemiesDefeated : Nat;
  } {
    switch (gameStates.get(playerId)) {
      case (?state) {
        {
          health = state.health;
          ammunition = state.ammunition;
          score = state.score;
          enemiesDefeated = state.enemiesDefeated;
        };
      };
      case (null) { Runtime.trap("No game state for player " # playerId.toText()) };
    };
  };
};
