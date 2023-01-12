package com.example.module6;

import static com.example.module6.chat.Flags.REQUEST_ENABLE_BLUETOOTH;
import static com.example.module6.chat.Flags.STATE_CONNECTED;
import static com.example.module6.chat.Flags.STATE_CONNECTING;
import static com.example.module6.chat.Flags.STATE_CONNECTION_FAILED;
import static com.example.module6.chat.Flags.STATE_LISTENING;
import static com.example.module6.chat.Flags.STATE_MESSAGE_RECEIVED;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.view.MenuItem;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.PopupMenu;
import android.widget.TextView;

import com.example.module6.chat.ClientThread;
import com.example.module6.chat.SendReceiveThread;
import com.example.module6.chat.ServerThread;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public class ChatActivity extends AppCompatActivity {

    private static final String TAG = "Bluetooth_Chat_TAG";

    // chat
    Button bListen, bSend;
    TextView msgBox, status, listPaired;
    EditText writeBox;

    BluetoothAdapter mBluetoothAdapter;
    BluetoothDevice[] btArray;

    SendReceiveThread sendReceive;

    private static final String APP = "bt";
    private static final UUID myUUID= UUID.fromString("8ce255c0-223a-11e0-ac64-0803450c9a66");

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_chat);

        findViewByIdes();
        mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();


        if(!mBluetoothAdapter.isEnabled())
        {
            Intent enableIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
            startActivityForResult(enableIntent,REQUEST_ENABLE_BLUETOOTH);
        }

        bListen.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                listenMessage();
            }
        });

        bSend.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                sendMessage();
            }
        });

        listPaired.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Set<BluetoothDevice> pairedDevices = mBluetoothAdapter.getBondedDevices();
                btArray = new BluetoothDevice[pairedDevices.size()];
                List<String> devices = new ArrayList<String>();

                int index=0;
                for(BluetoothDevice device : pairedDevices) {
                    devices.add(device.getAddress());
                    btArray[index]= device;
                    index++;
                }
                int i=0;
                PopupMenu popup = new PopupMenu(ChatActivity.this, view);
                for (String device : devices) {
                    String id;
                    id =  "R.id.slot" + String.valueOf(i);
                    popup.getMenu().add(1, i , i, device);
//                    popup.getMenu().add(groupId, itemId, order, title);
                    i++;
                }
//                popup.setOnMenuItemClickListener(ChatActivity.this::settingsMenuClick);
                popup.show();

                popup.setOnMenuItemClickListener(new PopupMenu.OnMenuItemClickListener() {
                    @Override
                    public boolean onMenuItemClick(MenuItem menuItem) {
                        startChat(menuItem);
                        return false;
                    }
                });
            }
        });


    }

    private void findViewByIdes() {
        bListen = findViewById(R.id.btnListen);
        bSend = findViewById(R.id.btnSend);
        listPaired = findViewById(R.id.tvListPairedChat);
        msgBox = findViewById(R.id.tvChat);
        status = findViewById(R.id.tvStatus);
        writeBox = findViewById(R.id.etWriteMsg);
    }

    Handler handler = new Handler(new Handler.Callback() {
        @Override
        public boolean handleMessage(@NonNull Message message) {
            switch (message.what)
            {
                case STATE_LISTENING:
                    status.setText("Listening");
                    break;
                case STATE_CONNECTING:
                    status.setText("Connecting");
                    break;
                case STATE_CONNECTED:
                    status.setText("Connected");
                    break;
                case STATE_CONNECTION_FAILED:
                    status.setText("Connection Failed");
                    break;
                case STATE_MESSAGE_RECEIVED:
                    byte[] readBuff= (byte[]) message.obj;
                    String tempMsg=new String(readBuff,0,message.arg1);
                    msgBox.setText(tempMsg);
                    break;
            }
            return true;
        }
    });

    /** Menu button to launch feature specific settings. */
    protected boolean settingsMenuClick(MenuItem item) {
//        if (item.getItemId() == R.id.make_unpair_item) {
//            makeDeviceUnpair(Holder.getInstance().getiPosition());
//            return true;
//        } else if (item.getItemId() == R.id.make_chat){
//            startChat(Holder.getInstance().getiPosition());
//            return true;
//        }
        return false;
    }

    private void startChat(MenuItem i){
        ClientThread clientThread = new ClientThread(btArray[i.getItemId()], myUUID, handler);
        clientThread.start();
        status.setText("Connecting");
    }

    private void listenMessage(){
        ServerThread serverThread = new ServerThread(mBluetoothAdapter, APP, myUUID, handler);
        serverThread.start();
    }

    private void sendMessage(){
        String string= String.valueOf(writeBox.getText());
        sendReceive.write(string.getBytes());
    }
}