import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

void main() {
  runApp(NetGuardApp());
}

class NetGuardApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NetGuard Pro',
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: Colors.cyan,
        scaffoldBackgroundColor: Color(0xFF060606),
      ),
      home: DashboardPage(),
    );
  }
}

class DashboardPage extends StatefulWidget {
  @override
  _DashboardPageState createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  List devices = [];
  Map stats = {"download": "0", "upload": "0", "ping": "0"};
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchData();
  }

  Future<void> fetchData() async {
    try {
      // Note: Using port 3000 as configured in the project
      final deviceRes = await http.get(Uri.parse('http://localhost:3000/api/devices'));
      final statsRes = await http.get(Uri.parse('http://localhost:3000/api/stats'));

      if (deviceRes.statusCode == 200 && statsRes.statusCode == 200) {
        setState(() {
          devices = json.decode(deviceRes.body);
          stats = json.decode(statsRes.body);
          isLoading = false;
        });
      }
    } catch (e) {
      print("Error fetching data: $e");
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('NetGuard Pro', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(icon: Icon(Icons.refresh), onPressed: fetchData),
        ],
      ),
      body: isLoading 
        ? Center(child: CircularProgressIndicator(color: Colors.cyan))
        : Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Stats Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildStatItem("Download", stats["download"], Icons.download, Colors.green),
                    _buildStatItem("Upload", stats["upload"], Icons.upload, Colors.blue),
                    _buildStatItem("Ping", stats["ping"], Icons.timer, Colors.orange),
                  ],
                ),
                SizedBox(height: 32),
                Text("Connected Devices", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                SizedBox(height: 16),
                Expanded(
                  child: ListView.builder(
                    itemCount: devices.length,
                    itemBuilder: (context, index) {
                      final device = devices[index];
                      return Container(
                        margin: EdgeInsets.only(bottom: 12),
                        padding: EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.05),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.white.withOpacity(0.1)),
                        ),
                        child: Row(
                          children: [
                            CircleAvatar(
                              backgroundColor: Colors.cyan.withOpacity(0.1),
                              child: Icon(Icons.devices, color: Colors.cyan),
                            ),
                            SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(device["name"], style: TextStyle(fontWeight: FontWeight.bold)),
                                  Text(device["ip"], style: TextStyle(color: Colors.white54, fontSize: 12)),
                                ],
                              ),
                            ),
                            Container(
                              padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.green.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                device["status"], 
                                style: TextStyle(color: Colors.green, fontSize: 10, fontWeight: FontWeight.bold)
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon, Color color) {
    return Column(
      children: [
        Icon(icon, color: color, size: 20),
        SizedBox(height: 8),
        Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        Text(label, style: TextStyle(color: Colors.white38, fontSize: 10)),
      ],
    );
  }
}
