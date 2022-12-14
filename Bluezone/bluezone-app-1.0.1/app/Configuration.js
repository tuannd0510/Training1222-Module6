/*
 * @Project Bluezone
 * @Author Bluezone Global (contact@bluezone.ai)
 * @Createdate 04/26/2020, 16:36
 *
 * This file is part of Bluezone (https://bluezone.ai)
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

'use strict';

import AsyncStorage from '@react-native-community/async-storage';
import axios from 'axios';
// import moment from 'moment';
import PushNotification from 'react-native-push-notification';
import {Platform} from 'react-native';
import RNFS from 'react-native-fs';
import Service from './apis/service';
import {
  hasNotifySystem,
  // NOTIFY_INVITE_NUMBER,
} from './utils/notifyConfiguration';

const DOMAIN = 'https://apibz.bkav.com';

// CONST
const TIME_RETRY = [2000, 3000, 5000, 8000, 13000, 21000, 34000, 55000];
let CURRENT_RETRY = 0;
let timerRegister;
let CURRENT_RETRY_UPDATE_TOKEN_FCM = 0;
let timerUpdateToken;
// const TypeOS = Platform.OS === 'android' ? 1 : 2;
let UPDATE_TOKEN_FIREBASE_RUNNING = false;
let REGISTER_USER_RUNNING = false;
const filePath = RNFS.ExternalStorageDirectoryPath + '/Bluezone/.id';
const validDateRegx = /^[0-9A-Za-z]{6}$/;

// Create UserCode in JS
// const generateRandom = () => {
//   var szCharSet =
//     '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
//   var nSizeCharSet = szCharSet.length;
//   var UserCode = '';
//
//   global.Math.seedrandom(new Date().getTime());
//
//   for (var i = 0; i < 6; i++) {
//     UserCode += szCharSet.charAt(
//       global.Math.floor(global.Math.random() * nSizeCharSet),
//     );
//   }
//
//   return UserCode;
// };

const validateUserCode = id => validDateRegx.test(id);

const getUserIdFromFile = async onResult => {
  RNFS.exists(filePath)
    .then(result => {
      if (result) {
        RNFS.readFile(filePath, 'utf8')
          .then(value => {
            onResult(value);
          })
          .catch(() => onResult());
      } else {
        onResult();
      }
    })
    .catch(() => onResult());
};

const saveUserToFile = UserCode => {
  RNFS.writeFile(filePath, UserCode, 'utf8')
    .then(success => {
      console.log('WRITEN ID TO FILE SUCCES!');
    })
    .catch(err => {
      console.log('WRITEN ID TO FILE ERROR:' + err.message);
    });
};

const createUserCode = async () => {
  const UserCode = await Service.generatorId();
  return UserCode;
};

const configuration = {
  LinkQRAndroid:
    'https://play.google.com/store/apps/details?id=com.mic.bluezone',
  LinkQRIOS: 'https://apps.apple.com/us/app/bluezone/id1508062685?ls=1',
  LinkShareAndroid:
    'https://play.google.com/store/apps/details?id=com.mic.bluezone',
  LinkShareIOS: 'https://apps.apple.com/us/app/bluezone/id1508062685?ls=1',
  Introduce: 'https://bluezone.vn',
  TimeSaveLog: 10000,
  TimeShowLog: 30000,
  RssiThreshold: -69,
  PeriodDay: 14,
  DbMaxRow: 100000,
  DbMaxDay: 180,
  ScanBleRun: 25000,
  ScanBleSleep: 95000,
  BroadcastBleRun: 15000,
  BroadcastBleSleep: 15000,
  ScanDevicesRun: 25000,
  ScanDevicesSleep: 95000,
  Beta: true,
  ShareAppText: 'Chia s??? ???ng d???ng',
  ShareMessageText:
    'Bluezone: \n\nPhi??n b???n IOS: {LinkShareIOS} \n\nPhi??n b???n Android: {LinkShareAndroid}',
  NOTIFI_BLE_IOS_TEXT:
    'Bluezone kh??ng th??? ghi nh???n c??c "ti???p x??c g???n" v?? thi???t b??? ch??a B???t Bluetooth.\n\nBluezone s??? d???ng Bluetooth n??ng l?????ng th???p BLE. C??ng ngh??? n??y kh??ng t???n pin ngay c??? khi lu??n b???t.\n\nB???n c???n b???t Bluetooth b???ng c??ch v??o B???ng ??i???u khi???n ho???c v??o C??i ?????t ????? c???u h??nh.',
  NOTIFI_PERMISSION_BLE_IOS_TEXT:
    'Bluezone s??? d???ng Bluetooth n??ng l?????ng th???p BLE ????? ghi nh???n nh???ng ng?????i "ti???p x??c g???n" v???i b???n. C??ng ngh??? n??y kh??ng t???n pin ngay c??? khi lu??n b???t.\n\nB???n c???n ?????ng ?? b???t Bluetooth ????? c?? th??? ghi nh???n c??c "ti???p x??c g???n".',
  NOTIFI_PERMISSION_TEXT:
    'B???n c???n ?????ng ?? c???p quy???n th??ng b??o ????? ???ng d???ng c?? th??? g???i c???nh b??o n???u b???n "ti???p x??c g???n" ng?????i nhi???m COVID-19 trong t????ng lai.',
  NOTIFI_PERMISSION_LOCATION_ANDROID_TEXT:
    'Bluezone kh??ng s??? d???ng v??? tr?? c???a thi???t b???. Bluezone ch??? b???t Bluetooth n??ng l?????ng th???p BLE ????? ghi nh???n c??c "ti???p x??c g???n".\n\nM???c d?? v???y, theo ch??nh s??ch c???a Google, khi b???t Bluetooth BLE thi???t b??? s??? t??? ?????ng ????? ngh??? truy c???p v??? tr?? thi???t b???, ngay c??? khi Bluezone kh??ng s??? d???ng t???i quy???n ????.\n\nB???n c???n c???p quy???n ????? c?? th??? ghi nh???n c??c "ti???p x??c g???n',
  NOTIFI_LOCATION_ANDROID_TEXT:
    'Bluezone kh??ng th??? ghi nh???n c??c "ti???p x??c g???n" v?? thi???t b??? ch??a B???t v??? tr??.\n\nBluezone ch??? s??? d???ng Bluetooth n??ng l?????ng th???p BLE ????? ghi nh???n c??c "ti???p x??c g???n". Tuy nhi??n, theo ch??nh s??ch c???a Google, khi b???t Bluetooth BLE thi???t b??? s??? t??? ?????ng ????? ngh??? truy c???p v??? tr?? thi???t b???, ngay c??? khi Bluezone kh??ng s??? d???ng t???i quy???n ????.\n\nB???n c???n c???p quy???n B???t v??? tr?? ????? c?? th??? ghi nh???n c??c "ti???p x??c g???n".',
  NOTIFI_PERMISSION_WRITE_FILE_TEXT:
    'Bluezone ch??? s??? d???ng quy???n "truy c???p t???p" ????? ghi l???ch s??? "ti???p x??c g???n" l??n b??? nh??? thi???t b???.\n\nM???c d?? v???y, theo ch??nh s??ch c???a Google, thi???t b??? v???n t??? ?????ng ????? ngh??? "cho ph??p truy c???p v??o ???nh, ph????ng ti???n v?? t???p" ngay c??? khi Bluezone kh??ng s??? d???ng c??c quy???n c??n l???i.\n\nB???n c???n c???p quy???n ????? c?? th??? ghi nh???n c??c "ti???p x??c g???n".',
  NOTIFI_BLUETOOTH_ANDROID_TEXT:
    'Bluezone kh??ng th??? ghi nh???n c??c "ti???p x??c g???n" v?? thi???t b??? ch??a B???t Bluetooth.\n\nBluezone s??? d???ng Bluetooth n??ng l?????ng th???p BLE. C??ng ngh??? n??y kh??ng t???n pin ngay c??? khi lu??n b???t.\n\nB???n c???n b???t Bluetooth b???ng c??ch v??o B???ng ??i???u khi???n ho???c v??o C??i ?????t ????? c???u h??nh.',
  NOTIFI_PERMISSION_BLOCK_LOCATION_ANDROID_TEXT:
    'Bluezone kh??ng th??? ghi nh???n c??c "ti???p x??c g???n" v?? thi???t b??? ch??a B???t v??? tr??.\n\nBluezone ch??? s??? d???ng Bluetooth n??ng l?????ng th???p BLE ????? ghi nh???n c??c "ti???p x??c g???n". Tuy nhi??n, theo ch??nh s??ch c???a Google, khi b???t Bluetooth BLE thi???t b??? s??? t??? ?????ng ????? ngh??? truy c???p v??? tr?? thi???t b???, ngay c??? khi Bluezone kh??ng s??? d???ng t???i quy???n ????.\n\nB???n c???n c???p quy???n B???t v??? tr?? b???ng c??ch v??o "C??i ?????t / ???ng d???ng / Bluezone / Quy???n"',
  NOTIFI_PERMISSION_WRITE_FILE_BLOCK_TEXT:
    'Bluezone kh??ng th??? ghi nh???n c??c "ti???p x??c g???n" v?? thi???t b??? ch??a B???t quy???n truy c???p t???p\n\nM???c d?? v???y, theo ch??nh s??ch c???a Google, thi???t b??? v???n t??? ?????ng ????? ngh??? "cho ph??p truy c???p v??o ???nh, ph????ng ti???n v?? t???p" ngay c??? khi Bluezone kh??ng s??? d???ng c??c quy???n c??n l???i.\n\nB???n c???n c???p quy???n B???t l??u tr??? b???ng c??ch v??o "C??i ?????t / ???ng d???ng / Bluezone / Quy???n"',
  UserCode: '',
  Token: '',
  TokenFirebase: '',
  TimeEnableBluetooth: 300000,
  BatteryEnableBluetooth: 15,
  Notifications: [],
  PermissonNotificationsAndroid: [],
  PermissonNotificationsIos: [],
};

const getConfigurationAsync = async () => {
  AsyncStorage.multiGet(['Token', 'Configuration', 'TokenFirebase']).then(
    results => {
      let keys = {};
      results.forEach(result => {
        Object.assign(keys, {[result[0]]: result[1]});
      });

      const {Token, Configuration, TokenFirebase} = keys;
      const configObject = JSON.parse(Configuration || '{}');

      mergeConfiguration(configObject, Token, TokenFirebase);
    },
  );
};

const mergeConfiguration = (configObject, Token, TokenFirebase) => {
  Object.assign(configuration, configObject, {
    Token: Token || '',
    TokenFirebase: TokenFirebase || '',
  });
};

const getUserCodeAsync = async () => {
  const UserCode = await AsyncStorage.getItem('UserCode');
  if (validateUserCode(UserCode)) {
    Service.setUserId(UserCode);
    Object.assign(configuration, {
      UserCode: UserCode,
    });
    Platform.OS !== 'ios' && saveUserToFile(UserCode);
  } else {
    // Service.restoreDb();
    getUserIdFromFile(getUserIdFromFileCallback);
  }
};

const getUserIdFromFileCallback = async userCodeFromFile => {
  const userCode = validateUserCode(userCodeFromFile)
    ? userCodeFromFile
    : await createUserCode();
  AsyncStorage.setItem('UserCode', userCode);
  Service.setUserId(userCode);
  Object.assign(configuration, {
    UserCode: userCode,
  });
  Platform.OS !== 'ios' && saveUserToFile(userCode);
};

function notifySchedule(notify, timestamp) {
  PushNotification.localNotificationSchedule({
    /* Android Only Properties */
    id: notify.id,
    largeIcon: 'icon_bluezone_null',
    smallIcon: 'icon_bluezone_service',
    bigText: notify.bigText,
    subText: notify.subText,
    vibrate: true,
    importance: notify.importance,
    priority: notify.priority,
    allowWhileIdle: false,
    ignoreInForeground: false,

    /* iOS only properties */
    alertAction: 'view',
    category: '',
    userInfo: {
      id: notify.id,
    },

    /* iOS and Android properties */
    title: notify.title,
    message: notify.message,
    playSound: false,
    number: notify.number,
    date: new Date(timestamp),
  });
}

const createNofityInvice = (config, firstTime) => {
  const newNotifys = config.Notifications || [];
  const oldNotifys = configuration.Notifications || [];

  newNotifys.forEach(notify => {
    const tf = oldNotifys.find(item => item.id === notify.id);
    if (tf) {
      return;
    }
    const timeSchedule = hasNotifySystem(notify, firstTime);
    if (timeSchedule) {
      notifySchedule(notify, timeSchedule);
    }
  });

  oldNotifys.forEach(notify => {
    const tf = newNotifys.find(item => item.id === notify.id);
    if (tf) {
      return;
    }

    // Xoa notify
    PushNotification.cancelLocalNotifications({id: notify.id});
  });
};

const removeNotifyPermisson = () => {
  const notifications =
    Platform.OS === 'ios'
      ? configuration.PermissonNotificationsIos
      : configuration.PermissonNotificationsAndroid;
  if (!notifications || notifications.length === 0) {
    return;
  }
  notifications.forEach(notify => {
    notify.id && PushNotification.cancelLocalNotifications({id: notify.id});
  });
};

const createNotifyPermisson = () => {
  const notifications =
    Platform.OS === 'ios'
      ? configuration.PermissonNotificationsIos
      : configuration.PermissonNotificationsAndroid;
  if (!notifications || notifications.length === 0) {
    return;
  }

  notifications.forEach(notify => {
    if (
      !notify.repeatTime ||
      notify.repeatTime < 0 ||
      !notify.dayStartTime ||
      notify.dayStartTime < 0
    ) {
      return;
    }

    let iDate = new Date().setHours(0, 0, 0, 0) + notify.dayStartTime;
    if (iDate < new Date().getTime()) {
      iDate += 86400000;
    }

    PushNotification.localNotificationSchedule({
      /* Android Only Properties */
      id: notify.id,
      largeIcon: 'icon_bluezone_null',
      smallIcon: 'icon_bluezone_service',

      bigText: notify.bigText,
      subText: notify.subText,
      vibrate: true,
      importance: notify.importance,
      priority: notify.priority,
      allowWhileIdle: false,
      ignoreInForeground: false,

      /* iOS only properties */
      alertAction: 'view',
      category: '',
      userInfo: {
        id: notify.id,
      },

      /* iOS and Android properties */
      title: notify.title,
      message: notify.message,
      playSound: false,
      number: notify.number,
      repeatType: 'time',
      repeatTime: notify.repeatTime,
      date: new Date(iDate),
    });
  });
};

// API l???y th??ng tin config .
const getConfigurationAPI = async (successCb, errorCb) => {
  // Option g???i server.
  const options = {
    method: 'GET',
    url: `${DOMAIN}/api/App/GetConfigApp`,
    timeout: 3000,
  };
  await axios(options).then(
    async response => {
      if (response && response.status === 200) {
        try {
          const data = response.data.Object;
          const firstTimeAsync = await AsyncStorage.getItem('firstTimeOpen');
          let firstTime = firstTimeAsync
            ? Number.parseInt(firstTimeAsync, 10)
            : null;

          if (!firstTime) {
            firstTime = new Date().getTime();
            await AsyncStorage.setItem('firstTimeOpen', firstTime.toString());
          }

          await createNofityInvice(data, firstTime);
          removeNotifyPermisson(data);

          // C???p nh???t th??ng tin configuration.
          Object.assign(configuration, data);

          successCb(configuration);

          // L??u l???i th??ng tin c???u h??nh.
          const configString = JSON.stringify(data);
          AsyncStorage.setItem('Configuration', configString);

          Service.setConfig(data);
        } catch (e) {
          errorCb(configuration);
        }
      }
    },
    async error => {
      errorCb(error);
    },
  );
};

// L??u th??ng tin Token
const setToken = Token => {
  Object.assign(configuration, {Token});
  AsyncStorage.setItem('Token', Token); // TODO by NhatPA: ??ang x???y ra tr?????ng h???p null
};

// L??u th??ng tin TokenFirebase
const setTokenFirebase = TokenFirebase => {
  if (
    configuration.TokenFirebase !== '' &&
    TokenFirebase === configuration.TokenFirebase
  ) {
    return;
  }
  console.log('TokenFirebase', TokenFirebase);
  if (configuration.Token === '') {
    registerUser(TokenFirebase);
  } else {
    updateTokenFirebase(TokenFirebase);
  }
};

const registerUser = async TokenFirebase => {
  if (REGISTER_USER_RUNNING || configuration.Token) {
    return;
  }
  REGISTER_USER_RUNNING = true;
  // Check n???u ??ang setTimeOut m?? v??o app ??? tr???ng th??i forground th?? clearTimeout.
  if (timerRegister) {
    CURRENT_RETRY = 0;
    clearTimeout(timerRegister);
  }

  // const {UserCode} = configuration;
  // T???o g??i data
  // const MacBluetooth = await DeviceInfo.getMacAddress(); // Android, ios: 00: 22, ios 7 , android , ios => sinh GUUI kh??c nhau
  // const MacBluetooth = '00:00:00:00:00'; // Android, ios: 00: 22, ios 7 , android , ios => sinh GUUI kh??c nhau
  const options = {
    method: 'post',
    data: {
      // UserCode: UserCode,
      TokenFirebase: TokenFirebase,
      // TypeOS: TypeOS,
      // MacBluetooth: MacBluetooth,
    },
    url: `${DOMAIN}/api/App/RegisterUser`,
  };

  axios(options).then(
    response => {
      REGISTER_USER_RUNNING = false;
      if (response && response.status === 200) {
        const {Token} = response.data.Object;

        timerRegister && clearTimeout(timerRegister);
        // Luu lai token
        setToken(Token);

        Object.assign(configuration, {TokenFirebase});
        AsyncStorage.setItem('TokenFirebase', TokenFirebase);
      }
    },
    error => {
      REGISTER_USER_RUNNING = false;
      // Start kich ban thu lai lien tuc toi khi duoc
      timerRegister && clearTimeout(timerRegister);
      if (CURRENT_RETRY < TIME_RETRY.length) {
        timerRegister = setTimeout(registerUser, TIME_RETRY[CURRENT_RETRY]);
        CURRENT_RETRY++;
      } else {
        CURRENT_RETRY = 0;
      }
    },
  );
};

const updateTokenFirebase = TokenFirebase => {
  if (UPDATE_TOKEN_FIREBASE_RUNNING) {
    return;
  }
  UPDATE_TOKEN_FIREBASE_RUNNING = true;
  // const {UserCode, Token} = configuration;

  // Option g???i server.
  const options = {
    method: 'post',
    data: {
      // UserCode: UserCode,
      // Token: Token,
      TokenFirebase: TokenFirebase,
      // TypeOS: TypeOS,
    },
    url: `${DOMAIN}/api/App/UpdateTokenFirebase`,
  };

  axios(options).then(
    response => {
      UPDATE_TOKEN_FIREBASE_RUNNING = false;
      if (response && response.status === 200) {
        timerUpdateToken && clearTimeout(timerUpdateToken);
      }
    },
    error => {
      UPDATE_TOKEN_FIREBASE_RUNNING = false;
      timerUpdateToken && clearTimeout(timerUpdateToken);
      if (CURRENT_RETRY_UPDATE_TOKEN_FCM < TIME_RETRY.length) {
        timerUpdateToken = setTimeout(
          updateTokenFirebase,
          TIME_RETRY[CURRENT_RETRY_UPDATE_TOKEN_FCM],
        );
        CURRENT_RETRY_UPDATE_TOKEN_FCM++;
      } else {
        CURRENT_RETRY_UPDATE_TOKEN_FCM = 0;
      }
    },
  );
};

const getConfig = () => {
  return configuration;
};

export default configuration;
export {
  setTokenFirebase,
  setToken,
  getConfigurationAPI,
  getConfigurationAsync,
  getUserCodeAsync,
  getConfig,
  registerUser,
  removeNotifyPermisson,
  createNotifyPermisson,
  DOMAIN,
};
