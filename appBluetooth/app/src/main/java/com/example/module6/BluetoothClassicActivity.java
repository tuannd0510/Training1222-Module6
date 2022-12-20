package com.example.module6;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;


import android.Manifest;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.Set;
import java.util.UUID;

public class BluetoothClassicActivity extends AppCompatActivity {

    Intent myEnablingIntent;
    Intent myDiscover;

    BluetoothAdapter myBluetoothAdapter;
    BroadcastReceiver myBroadcastReceiver;

    ArrayAdapter<String> arrayAdapterPaired;
    ArrayAdapter<String> arrayAdapterScan;

    public static String EXTRA_ADDRESS = "device_address";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_bluetooth_classic);

        /**
         * Truy suất các button và listview tới các control theo R.id
         */
        Button bSwitchBlue = findViewById(R.id.btnSwitchBlue);
        Button bScan = findViewById(R.id.btnScan);
        Button bPaired = findViewById(R.id.btnListPaired);
        ListView lvScan = findViewById(R.id.lstScan);
        ListView lvPaired = findViewById(R.id.lstPaired);

        myBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        myEnablingIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
        myDiscover = new Intent(BluetoothAdapter.ACTION_REQUEST_DISCOVERABLE);

        if (myBluetoothAdapter ==null){
            Toast.makeText(BluetoothClassicActivity.this,"This device doesn't support Bluetooth", Toast.LENGTH_LONG).show();
        }
        if (!myBluetoothAdapter.isEnabled()){
            bSwitchBlue.setText("Turn ON");
        }else{
            bSwitchBlue.setText("Turn OFF");
        }

        bSwitchBlue.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                System.out.println("Button turn on Bluetooth");
                if (!myBluetoothAdapter.isEnabled()) {
                    // Caller
                    getResult.launch(myEnablingIntent);
                }else{
                    myBluetoothAdapter.disable();
                    bSwitchBlue.setText("Turn ON");
                    Toast.makeText(BluetoothClassicActivity.this, "Bluetooth is OFF", Toast.LENGTH_LONG).show();
                }
            }

            // Receivers
            final ActivityResultLauncher<Intent> getResult = registerForActivityResult(
                    new ActivityResultContracts.StartActivityForResult(), result -> {
                        if (result.getResultCode() == RESULT_OK) {
                            Toast.makeText(BluetoothClassicActivity.this, "Bluetooth is ON", Toast.LENGTH_LONG).show();
                            bSwitchBlue.setText("Turn OFF");
                        } else if (result.getResultCode() == RESULT_CANCELED) {
                            Toast.makeText(BluetoothClassicActivity.this, "Bluetooth operation is cancelled", Toast.LENGTH_LONG).show();
                        }
                    });
        });

//        bTurnOn.setOnClickListener(new View.OnClickListener() {
//            @Override
//            public void onClick(View view) {
//                System.out.println("Button turn on Bluetooth");
//                if (myBluetoothAdapter == null) {
//                    Toast.makeText(getApplicationContext(), "Thiết bị của bạn không hỗ trợ bluetooth !!!", Toast.LENGTH_LONG).show();
//                } else if (!myBluetoothAdapter.isEnabled()) {
//                    // Caller
//                    getResult.launch(myEnablingIntent);
//                }
//            }
//
//            // Receivers
//            final ActivityResultLauncher<Intent> getResult = registerForActivityResult(
//                    new ActivityResultContracts.StartActivityForResult(), result -> {
//                        if (result.getResultCode() == RESULT_OK) {
//                            Toast.makeText(getApplicationContext(), "đã BẬT bluetooth !!!", Toast.LENGTH_LONG).show();
//                        } else if (result.getResultCode() == RESULT_CANCELED) {
//                            Toast.makeText(getApplicationContext(), "đã từ chối bật bluetooth !!!", Toast.LENGTH_LONG).show();
//                        }
//                    });
//        });
//
//        bTurnOff.setOnClickListener(new View.OnClickListener() {
//            @Override
//            public void onClick(View view) {
//                System.out.println("Button turn off Bluetooth");
//                if (myBluetoothAdapter.isEnabled()) {
//                    myBluetoothAdapter.disable();
//                    Toast.makeText(getApplicationContext(), "Đã TẮT bluetooth !!!", Toast.LENGTH_LONG).show();
//                } else {
//                    Toast.makeText(getApplicationContext(), "Chưa bật bluetooth !!!", Toast.LENGTH_LONG).show();
//                }
//            }
//        });

        bPaired.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                ArrayList<String> arrayList = new ArrayList<>();
                System.out.println("Button Paired: Looking for paired devices");
                Set<BluetoothDevice> pairedDevices = myBluetoothAdapter.getBondedDevices();
                if (pairedDevices.size() == 0) {
                    System.out.println("tuannd - chua paired" + pairedDevices.size());
                } else {
//                    String[] strings = new String[(pairedDevices.size())];
                    int i = 0;

                    if (pairedDevices.size() > 0) {
                        for (BluetoothDevice device : pairedDevices) {
                            arrayList.add(device.getName() +"\n" + device.getAddress());
                            System.out.println("List Paired: " + device.getName() +"\n" + device.getAddress());
                            i++;
                        }
                        arrayAdapterPaired = new ArrayAdapter<String>(getApplicationContext(), android.R.layout.simple_list_item_1, arrayList);
                        lvPaired.setAdapter(arrayAdapterPaired);
                    }
                }
            }
        });

        bScan.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                System.out.println("Button Scan: Looking for unpaired device");
//                int requestCode = 1;
//                Intent discoverableIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_DISCOVERABLE);
//                discoverableIntent.putExtra(BluetoothAdapter.EXTRA_DISCOVERABLE_DURATION, 30);
//                startActivityForResult(discoverableIntent, requestCode);
                myBluetoothAdapter.startDiscovery();

                ArrayList<String> arrayList = new ArrayList<>();
                // Create a BroadcastReceiver for ACTION_FOUND
                myBroadcastReceiver = new BroadcastReceiver() {
                    @Override
                    public void onReceive(Context context, Intent intent) {
                        String action = intent.getAction();
                        if (action.equals(BluetoothDevice.ACTION_FOUND)) {
                            // Discovery has found a device. Get the BluetoothDevice
                            // object and its info from the Intent.
                            BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
                            System.out.println("List discover: " + device.getName() + "\n" + device.getAddress());
                            arrayList.add(device.getName() + "\n" + device.getAddress());  // MAC address
                        }
                        arrayAdapterScan = new ArrayAdapter<String>(getApplicationContext(), android.R.layout.simple_list_item_1, arrayList);
                        lvScan.setAdapter(arrayAdapterScan);
                    }
                };
                // Register for broadcasts when a device is discovered.
                IntentFilter intentFilter = new IntentFilter(BluetoothDevice.ACTION_FOUND);
                registerReceiver(myBroadcastReceiver, intentFilter);
            }
        });
    }


    @Override
    protected void onDestroy() {
        System.out.println("onDestroy: called");
        super.onDestroy();

        unregisterReceiver(myBroadcastReceiver);
    }


}