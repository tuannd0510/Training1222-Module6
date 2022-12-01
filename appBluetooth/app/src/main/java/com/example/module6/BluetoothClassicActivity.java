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
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ListView;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.Set;

public class BluetoothClassicActivity extends AppCompatActivity {

    BluetoothAdapter myBluetoothAdapter;
    Intent myEnablingIntent;
    Intent myDiscover;

    ArrayAdapter<String> arrayAdapterPaired;

    ArrayAdapter<String> arrayAdapterScan;
    ArrayList<String> stringArrayList = new ArrayList<String>();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_bluetooth_classic);

        /**
         * Truy suất các button và listview tới các control theo R.id
         */
        Button bTurnOn = findViewById(R.id.btnTurnOnBT);
        Button bTurnOff = findViewById(R.id.btnTurnOffBT);
        Button bScan = findViewById(R.id.btnScan);
        Button bPaired = findViewById(R.id.btnListPaired);
        ListView lvScan = findViewById(R.id.lstScan);
        ListView lvPaired = findViewById(R.id.lstPaired);

        myBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        myEnablingIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
        myDiscover = new Intent(BluetoothAdapter.ACTION_REQUEST_DISCOVERABLE);

        /**
         * Sự kiện bật Bluetooth
         */
        bTurnOn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (myBluetoothAdapter == null) {
                    Toast.makeText(getApplicationContext(), "Thiết bị của bạn không hỗ trợ bluetooth !!!", Toast.LENGTH_LONG).show();
                } else if (!myBluetoothAdapter.isEnabled()) {
                    // Caller
                    getResult.launch(myEnablingIntent);
                }
            }

            // Receivers
            final ActivityResultLauncher<Intent> getResult = registerForActivityResult(
                    new ActivityResultContracts.StartActivityForResult(), result -> {
                        if (result.getResultCode() == RESULT_OK) {
                            Toast.makeText(getApplicationContext(), "đã BẬT bluetooth !!!", Toast.LENGTH_LONG).show();
                        } else if (result.getResultCode() == RESULT_CANCELED) {
                            Toast.makeText(getApplicationContext(), "đã từ chối bật bluetooth !!!", Toast.LENGTH_LONG).show();
                        }
                    });
        });

        /**
         * Sự kiện tắt Bluetooth
         */
        bTurnOff.setOnClickListener(view -> {
            if (myBluetoothAdapter.isEnabled()) {
                myBluetoothAdapter.disable();
                Toast.makeText(getApplicationContext(), "Đã TẮT bluetooth !!!", Toast.LENGTH_LONG).show();
            } else {
                Toast.makeText(getApplicationContext(), "Chưa bật bluetooth !!!", Toast.LENGTH_LONG).show();
            }
        });

        /**
         * Sự kiện tìm thiết bị kết nối
         */
        bPaired.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Set<BluetoothDevice> devices = myBluetoothAdapter.getBondedDevices();
                String[] strings = new String[(devices.size())];
                int i = 0;

                if (devices.size() > 0) {
                    for (BluetoothDevice device : devices) {
                        strings[i] = device.getName();
                        i++;
                    }
                    arrayAdapterPaired = new ArrayAdapter<String>(getApplicationContext(), android.R.layout.simple_list_item_1, strings);
                    lvPaired.setAdapter(arrayAdapterPaired);
                }
            }
        });

        bScan.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                myBluetoothAdapter.startDiscovery();

                // Register for broadcasts when a device is discovered.
                IntentFilter filter = new IntentFilter(BluetoothDevice.ACTION_FOUND);
                registerReceiver(receiver, filter);
                arrayAdapterScan = new ArrayAdapter<String>(getApplicationContext(), android.R.layout.simple_list_item_1, stringArrayList);
                lvScan.setAdapter(arrayAdapterScan);
            }
        });
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        // Don't forget to unregister the ACTION_FOUND receiver.
        unregisterReceiver(receiver);
    }

    // Create a BroadcastReceiver for ACTION_FOUND.
    private final BroadcastReceiver receiver = new BroadcastReceiver() {
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (BluetoothDevice.ACTION_FOUND.equals(action)) {
                // Discovery has found a device. Get the BluetoothDevice
                // object and its info from the Intent.
                BluetoothDevice device = intent.getParcelableExtra(BluetoothDevice.EXTRA_DEVICE);
                stringArrayList.add(device.getName());
                arrayAdapterScan.notifyDataSetChanged();
            }
        }
    };
}