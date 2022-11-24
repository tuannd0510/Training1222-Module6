package com.example.module6;

import androidx.activity.result.ActivityResult;
import androidx.activity.result.ActivityResultCallback;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.ListView;
import android.widget.Toast;


public class MainActivity extends AppCompatActivity {

    Button bTurnOn;
    Button bTurnOff;
    Button bScan;
    Button bPaired;
    ListView lvScan;
    ListView lvPaired;

    BluetoothAdapter myBluetoothAdapter;
    Intent btEnablingIntent;


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        bTurnOn = findViewById(R.id.btnTurnOnBT);
        bTurnOff = findViewById(R.id.btnTurnOffBT);
        bScan = findViewById(R.id.btnScan);
        bPaired = findViewById(R.id.btnListPaired);
        lvScan = findViewById(R.id.lstScan);
        lvPaired = findViewById(R.id.lstPaired);

        myBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        btEnablingIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);

        bTurnOn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (myBluetoothAdapter==null){
                    Toast.makeText(getApplicationContext(),"Thiết bị của bạn không hỗ trợ bluetooth !!!",Toast.LENGTH_LONG).show();
                }else if (!myBluetoothAdapter.isEnabled()){
                    // Caller
                    getResult.launch(btEnablingIntent);
                }
            }
            // Receivers
            ActivityResultLauncher<Intent> getResult = registerForActivityResult(
                    new ActivityResultContracts.StartActivityForResult(),
                    new ActivityResultCallback<ActivityResult>() {
                        @Override
                        public void onActivityResult(ActivityResult result) {
                            if (result.getResultCode() == RESULT_OK){
                                Toast.makeText(getApplicationContext(),"đã BẬT bluetooth !!!",Toast.LENGTH_LONG).show();
                            }else if (result.getResultCode() == RESULT_CANCELED){
                                Toast.makeText(getApplicationContext(),"đã từ chối bật bluetooth !!!",Toast.LENGTH_LONG).show();
                            }
                        }
                    });{
            }
        });

        bTurnOff.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (myBluetoothAdapter.isEnabled()){
                    myBluetoothAdapter.disable();
                    Toast.makeText(getApplicationContext(),"Đã TẮT bluetooth !!!",Toast.LENGTH_LONG).show();
                }else{
                    Toast.makeText(getApplicationContext(),"Chưa bật bluetooth !!!",Toast.LENGTH_LONG).show();
                }
            }
        });

        bPaired.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {

            }
        });
    }
}