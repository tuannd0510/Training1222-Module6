package com.example.module6;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

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


        bTurnOn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                if (myBluetoothAdapter==null){
                    Toast.makeText(getApplicationContext(),"Thiết bị của bạn không hỗ trợ bluetooth !!!",Toast.LENGTH_LONG).show();
                }else{
                    if (!myBluetoothAdapter.isEnabled()){
                        startActivityForResult(new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE),1);
                    }
                }
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
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode ==1){
            if (resultCode==RESULT_OK){
                Toast.makeText(getApplicationContext(),"đã BẬT bluetooth !!!",Toast.LENGTH_LONG).show();
            }else if (resultCode==RESULT_CANCELED){
                Toast.makeText(getApplicationContext(),"đã từ chối bật bluetooth !!!",Toast.LENGTH_LONG).show();
            }
        }
    }
}