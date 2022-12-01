package com.example.module6;

import androidx.appcompat.app.AppCompatActivity;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;


public class MainActivity extends AppCompatActivity {


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Button bBTClassic = findViewById(R.id.btnBTClassic);
        bBTClassic.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent i = new Intent(MainActivity.this,BluetoothClassicActivity.class);
                startActivity(i);
            }
        });

        Button bBTSocket = findViewById(R.id.btnBTSocket);
        bBTSocket.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent i = new Intent(MainActivity.this,BluetoothSocketActivity.class);
                startActivity(i);
            }
        });


    }




}