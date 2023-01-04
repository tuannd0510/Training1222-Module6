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
import android.os.Handler;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Set;
import java.util.UUID;

public class BluetoothClassicActivity extends AppCompatActivity {
    private static final String TAG = "Bluetooth_Classic_Activity_TAG";

    Button bSwitchBlue, bListScan, bListPaired;
    ListView lvScan, lvPaired;

    Intent myEnablingIntent;
    Intent myDiscoverIntent;

    BluetoothAdapter myBluetoothAdapter;
    BroadcastReceiver myBroadcastReceiver;

    ArrayAdapter<String> stringArrayAdapterPaired;
    ArrayAdapter<String> stringArrayAdapterScan;

    ArrayList<String> stringArrayListPaired;
    ArrayList<String> stringArrayListScan;
    ArrayList<BluetoothDevice> bluetoothDeviceArrayListScan;  // list use for pair
    ArrayList<BluetoothDevice> bluetoothDeviceArrayListPaired; // list use for unpair

    private static final String APP = "bt";
    private static final UUID myUUID= UUID.fromString("8ce255c0-223a-11e0-ac64-0803450c9a66");

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_bluetooth_classic);

        bSwitchBlue = findViewById(R.id.btnSwitchBlue);
        bListScan = findViewById(R.id.btnScan);
        bListPaired = findViewById(R.id.btnListPaired);
        lvScan = findViewById(R.id.lstScan);
        lvPaired = findViewById(R.id.lstPaired);

        myBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        myEnablingIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE); // enable request
        myDiscoverIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_DISCOVERABLE); // discovery request

        stringArrayListPaired = new ArrayList<>();
        stringArrayListScan = new ArrayList<>();
        bluetoothDeviceArrayListScan = new ArrayList<>();
        bluetoothDeviceArrayListPaired = new ArrayList<>();

        setTextSwitch();

        bSwitchBlue.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                turnOnOff();
            }
        });

        bListPaired.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                listPair();
            }
        });

        bListScan.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                scanBR();
            }
        });

        lvScan.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> adapterView, View view, int position, long id) {
                makeDevicePair(position);
            }
        });

        lvPaired.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> adapterView, View view, int position, long id) {
                makeDeviceUnpair(position);
            }
        });
    }


    @Override
    protected void onDestroy() {
        System.out.println("onDestroy: called");
        super.onDestroy();

//        unregisterReceiver(myBroadcastReceiver);
        unregisterReceiver(myReceiver);
    }

    @Override
    protected void onStop() {
        super.onStop();
        if (receiverScan != null) {
            unregisterReceiver(receiverScan);
            receiverScan = null;
        }
    }
    private BroadcastReceiver receiverScan;
    private BroadcastReceiver myReceiver = new BroadcastReceiver() {
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();

            if (BluetoothDevice.ACTION_BOND_STATE_CHANGED.equals(action)) {
                final int state = intent.getIntExtra(BluetoothDevice.EXTRA_BOND_STATE, BluetoothDevice.ERROR);
                final int prevState = intent.getIntExtra(BluetoothDevice.EXTRA_PREVIOUS_BOND_STATE, BluetoothDevice.ERROR);
                if (state == BluetoothDevice.BOND_BONDED && prevState == BluetoothDevice.BOND_BONDING) {
                    Toast.makeText(context, "Paired", Toast.LENGTH_SHORT).show();
                } else if (state == BluetoothDevice.BOND_NONE && prevState == BluetoothDevice.BOND_BONDED){
                    Toast.makeText(context, "Unpaired", Toast.LENGTH_SHORT).show();
                }
            }
        }
    };

    // Receivers
    private final ActivityResultLauncher<Intent> getResult = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(), result -> {
                if (result.getResultCode() == RESULT_OK) {
                    Toast.makeText(BluetoothClassicActivity.this, "Bluetooth is ON", Toast.LENGTH_LONG).show();
                    bSwitchBlue.setText("Turn OFF");
                } else if (result.getResultCode() == RESULT_CANCELED) {
                    Toast.makeText(BluetoothClassicActivity.this, "Bluetooth operation is cancelled", Toast.LENGTH_LONG).show();
                }
            });

    private void setTextSwitch(){
        if (myBluetoothAdapter ==null){
            Toast.makeText(BluetoothClassicActivity.this,"This device doesn't support Bluetooth", Toast.LENGTH_LONG).show();
        }
        if (!myBluetoothAdapter.isEnabled()){
            bSwitchBlue.setText("Turn ON");
        }else{
            bSwitchBlue.setText("Turn OFF");
        }
    }

    private void turnOnOff(){
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

    private void scanBR(){
        Log.i(TAG,"Button Scan: Looking for unpaired device");

        stringArrayListScan.clear();
        if (receiverScan != null || myBluetoothAdapter.isDiscovering()) {
            unregisterReceiver(receiverScan);
            receiverScan = null;
            myBluetoothAdapter.cancelDiscovery();
            stringArrayAdapterScan.clear();
        }

        receiverScan = new BroadcastReceiver() {
            public void onReceive(Context context, Intent intent) {
                // show in scan list view
                stringArrayAdapterScan = new ArrayAdapter<>(getApplicationContext(), android.R.layout.simple_list_item_1, stringArrayListScan);
                lvScan.setAdapter(stringArrayAdapterScan);

                String action = intent.getAction();
                if (action.equals(BluetoothDevice.ACTION_FOUND)) {
                    // Discovery has found a device. Get the BluetoothDevice object and its info from the Intent.
                    BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
                    Log.i(TAG,"List Discover: " + device.getName() + " - " + device.getAddress());

                    stringArrayListScan.add(device.getName() + "\n" + device.getAddress());
                    bluetoothDeviceArrayListScan.add(device);
                }
            }
        };
        // Register for broadcasts when a device is discovered.
        IntentFilter filter  = new IntentFilter(BluetoothDevice.ACTION_FOUND);
        registerReceiver(receiverScan, filter);
        myBluetoothAdapter.startDiscovery();
    }

    private void scanBLE(){

    }

    private void listPair(){
        stringArrayListPaired.clear();
        Log.i(TAG,"Button Paired: List paired devices");
        Set<BluetoothDevice> pairedDevices = myBluetoothAdapter.getBondedDevices();
        if (pairedDevices.size() == 0) {
            Log.e(TAG,"size = 0");
        } else {
            int i = 0;

            if (pairedDevices.size() > 0) {
                for (BluetoothDevice device : pairedDevices) {
                    stringArrayListPaired.add(device.getName() +"\n" + device.getAddress());
                    bluetoothDeviceArrayListPaired.add(device);
                    Log.i(TAG, "List Paired: "+ device.getName() +" - " + device.getAddress());
                    i++;
                }
                stringArrayAdapterPaired = new ArrayAdapter<>(getApplicationContext(), android.R.layout.simple_list_item_1, stringArrayListPaired);
                lvPaired.setAdapter(stringArrayAdapterPaired);
            }
        }
    }

    private void makeDevicePair(int position) {
        BluetoothDevice device = bluetoothDeviceArrayListScan.get(position);
        Log.i(TAG, "Request pair: "+ device.getName() +" - " + device.getAddress());

        if (device.getBondState() == BluetoothDevice.BOND_NONE) {
            device.createBond();
        }
        // Register for broadcasts
        IntentFilter intentFilter = new IntentFilter(BluetoothDevice.ACTION_BOND_STATE_CHANGED);
        registerReceiver(myReceiver, intentFilter);
    }

    private void makeDeviceUnpair(int position) {
        BluetoothDevice device = bluetoothDeviceArrayListPaired.get(position);
//        BluetoothDevice device = myBluetoothAdapter.getRemoteDevice(address);
        if (device.getBondState() == BluetoothDevice.BOND_BONDED) {
            try {
                Method m = device.getClass().getMethod("removeBond", (Class[]) null);
                m.invoke(device, (Object[]) null);
                Log.e("Unpaired", device.getAddress());
            } catch (Exception e) {
                Log.e("unpaired", e.getMessage());
            }
        }
        // Register for broadcasts
        IntentFilter intentFilter = new IntentFilter(BluetoothDevice.ACTION_BOND_STATE_CHANGED);
        registerReceiver(myReceiver, intentFilter);
    }

}