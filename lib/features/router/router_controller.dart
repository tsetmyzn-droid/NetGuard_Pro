import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:netguard_pro/features/router/huawei_plugin.dart';

final routerProvider = StateNotifierProvider<RouterController, RouterState>((ref) {
  return RouterController();
});

class RouterState {
  final bool isConnected;
  final String status;
  final String model;

  RouterState({this.isConnected = false, this.status = "Disconnected", this.model = "Unknown"});

  RouterState copyWith({bool? isConnected, String? status, String? model}) {
    return RouterState(
      isConnected: isConnected ?? this.isConnected,
      status: status ?? this.status,
      model: model ?? this.model,
    );
  }
}

class RouterController extends StateNotifier<RouterState> {
  RouterController() : super(RouterState());

  Future<void> connect(String ip, String pass) async {
    state = state.copyWith(status: "Identifying...");

    // --- INSULT LOGIC (Mock) ---
    if (ip == "127.0.0.1") {
      state = state.copyWith(status: "Error: Connecting to yourself? You are a genius.");
      return;
    }
    
    if (pass.length < 4) {
       state = state.copyWith(status: "Error: Password too short. Even a toddler can hack you.");
       return;
    }
    // ---------------------------

    try {
      final plugin = HuaweiPlugin(ip);
      final success = await plugin.login("admin", pass);
      
      if (success) {
        state = state.copyWith(
          isConnected: true, 
          status: "Connected Securely", 
          model: plugin.name
        );
      }
    } catch (e) {
      state = state.copyWith(status: "Fatal Error: Router rejected your existence.");
    }
  }
}
