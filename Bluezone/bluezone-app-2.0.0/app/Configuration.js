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
import {NativeModules, Platform} from 'react-native';
import RNFS from 'react-native-fs';
import Service from './apis/service';
import {
  hasNotifySystem,
  // NOTIFY_INVITE_NUMBER,
} from './utils/notifyConfiguration';
import {DOMAIN} from './apis/server';

// CONST
let TIME_RETRY = [0, 0, 0, 0, 0];
const TIME_RETRY_UPDATE_TOKEN_FIREBASE = [
  1000,
  2000,
  3000,
  5000,
  8000,
  13000,
  21000,
  34000,
  55000,
];
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

const removeFileSaveUser = () => {
  return RNFS.unlink(filePath)
    .then(() => {
      console.log('FILE DELETED');
    })
    .catch(err => {
      console.log(err.message);
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
  Introduce_en: 'https://bluezone.ai',
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
  ShareAppText_en: 'Share the app',
  JoinGroupFaceText: 'Tham gia group tr??n Facebook',
  JoinGroupFaceText_en: 'Join the group on Facebook',
  ShareMessageText:
    'B??? Y t???: B???o v??? m??nh, b???o v??? c???ng ?????ng ch???ng COVID-19 ????a cu???c s???ng tr??? l???i b??nh th?????ng. B???n ???? c??i ???ng d???ng Kh???u trang ??i???n t??? Bluezone v?? c??i ti???p cho 3 ng?????i kh??c ch??a? C??i ?????t t???i www.Bluezone.gov.vn \n\n#Khautrangdientu\n#Bluezone\n#Baoveminh\n#Baovecongdong\n#Caicho3nguoi',
  ShareMessageText_en:
    'Ministry of Health: Protect yourself, protect the community against COVID-19, bringing life back to normal. Have you installed electronic mask application Bluezone and got 3 others to install the app? Get the app at www.Bluezone.ai \n\n#Electronicmask\n#Bluezone\n#Protectyourself\n#Protectcommunity\n#Installfor3people',
  NOTIFI_BLE_IOS_TEXT:
    'Bluezone kh??ng th??? ghi nh???n c??c "ti???p x??c g???n" v?? thi???t b??? ch??a B???t Bluetooth.\n\nBluezone s??? d???ng Bluetooth n??ng l?????ng th???p BLE. C??ng ngh??? n??y kh??ng t???n pin ngay c??? khi lu??n b???t.\n\nB???n c???n b???t Bluetooth b???ng c??ch v??o B???ng ??i???u khi???n ho???c v??o C??i ?????t ????? c???u h??nh.',
  NOTIFI_BLE_IOS_TEXT_en:
    'Bluezone cannot record "close contact" because the device has not turned Bluetooth on.\n\nBluezone uses Bluetooth Low Energy (BLE). This technology does not drain the battery even when it is turned on.\n\nYou need to turn on Bluetooth by going to Control Panel or Settings to configure.',
  NOTIFI_PERMISSION_BLE_IOS_TEXT:
    'Bluezone s??? d???ng Bluetooth n??ng l?????ng th???p BLE ????? ghi nh???n nh???ng ng?????i "ti???p x??c g???n" v???i b???n. C??ng ngh??? n??y kh??ng t???n pin ngay c??? khi lu??n b???t.\n\nB???n c???n ?????ng ?? b???t Bluetooth ????? c?? th??? ghi nh???n c??c "ti???p x??c g???n".',
  NOTIFI_PERMISSION_BLE_IOS_TEXT_en:
    'Bluezone uses Bluetooth Low Energy BLE to recognize people who are in "close contact" with you. This technology does not drain the battery even when it is turned on.\n\nYou need to agree to turn on Bluetooth to record "close contact".',
  NOTIFI_PERMISSION_TEXT:
    'B???n c???n ?????ng ?? c???p quy???n th??ng b??o ????? ???ng d???ng c?? th??? g???i c???nh b??o n???u b???n "ti???p x??c g???n" ng?????i nhi???m COVID-19 trong t????ng lai.',
  NOTIFI_PERMISSION_TEXT_en:
    'You need to accept notification permission so that the application can send alerts if you have ???close contact" with people infected with COVID-19 in the future.',
  NOTIFI_PERMISSION_LOCATION_ANDROID_TEXT:
    'Bluezone kh??ng s??? d???ng v??? tr?? c???a thi???t b???. Bluezone ch??? b???t Bluetooth n??ng l?????ng th???p BLE ????? ghi nh???n c??c "ti???p x??c g???n".\n\nM???c d?? v???y, theo ch??nh s??ch c???a Google, khi b???t Bluetooth BLE thi???t b??? s??? t??? ?????ng ????? ngh??? truy c???p v??? tr?? thi???t b???, ngay c??? khi Bluezone kh??ng s??? d???ng t???i quy???n ????.\n\nB???n c???n c???p quy???n ????? c?? th??? ghi nh???n c??c "ti???p x??c g???n"',
  NOTIFI_PERMISSION_LOCATION_ANDROID_TEXT_en:
    'Bluezone does not use the device location. Bluezone only turns on Bluetooth Low Energy (BLE) to record "close contact".\n\nHowever, according to Google policy, when BLE is turned on the device will automatically offer to access the device location, even if Bluezone does not use that permission.\n\nYou need to accept the permission to record "close contact".',
  NOTIFI_LOCATION_ANDROID_TEXT:
    'Bluezone kh??ng th??? ghi nh???n c??c "ti???p x??c g???n" v?? thi???t b??? ch??a B???t v??? tr??.\n\nBluezone ch??? s??? d???ng Bluetooth n??ng l?????ng th???p BLE ????? ghi nh???n c??c "ti???p x??c g???n". Tuy nhi??n, theo ch??nh s??ch c???a Google, khi b???t Bluetooth BLE thi???t b??? s??? t??? ?????ng ????? ngh??? truy c???p v??? tr?? thi???t b???, ngay c??? khi Bluezone kh??ng s??? d???ng t???i quy???n ????.\n\nB???n c???n c???p quy???n B???t v??? tr?? ????? c?? th??? ghi nh???n c??c "ti???p x??c g???n".',
  NOTIFI_LOCATION_ANDROID_TEXT_en:
    'Bluezone cannot record "close contact" because the device has not enabled location.\n\nBluezone only turns on Bluetooth Low Energy (BLE) to record "close contact". However, according to Google policy, when BLE is turned on the device will automatically offer the access to device location, even if Bluezone does not use that permission.\n\nYou need to accept the permission to enable location to record "close contact".',
  NOTIFI_PERMISSION_WRITE_FILE_TEXT:
    'Bluezone ch??? s??? d???ng quy???n "truy c???p t???p" ????? ghi l???ch s??? "ti???p x??c g???n" l??n b??? nh??? thi???t b???.\n\nM???c d?? v???y, theo ch??nh s??ch c???a Google, thi???t b??? v???n t??? ?????ng ????? ngh??? "cho ph??p truy c???p v??o ???nh, ph????ng ti???n v?? t???p" ngay c??? khi Bluezone kh??ng s??? d???ng c??c quy???n c??n l???i.\n\nB???n c???n c???p quy???n ????? c?? th??? ghi nh???n c??c "ti???p x??c g???n".',
  NOTIFI_PERMISSION_WRITE_FILE_TEXT_en:
    'Bluezone only uses ???access to file" permission to write the history of "close contact??? on device memory.\n\nHowever, according to Google policy, the device automatically recommends "access to photos, media and files??? even if Bluezone does not use the two first permissions.\n\nYou need to accept permissions to record "close contact".',
  NOTIFI_BLUETOOTH_ANDROID_TEXT:
    'Bluezone kh??ng th??? ghi nh???n c??c "ti???p x??c g???n" v?? thi???t b??? ch??a B???t Bluetooth.\n\nBluezone s??? d???ng Bluetooth n??ng l?????ng th???p BLE. C??ng ngh??? n??y kh??ng t???n pin ngay c??? khi lu??n b???t.\n\nB???n c???n b???t Bluetooth b???ng c??ch v??o B???ng ??i???u khi???n ho???c v??o C??i ?????t ????? c???u h??nh.',
  NOTIFI_BLUETOOTH_ANDROID_TEXT_en:
    'Bluezone cannot record "close contact" because the device has not turned Bluetooth on.\n\nBluezone uses Bluetooth Low Energy (BLE). This technology does not drain the battery even when it is turned on.\n\nYou need to turn on Bluetooth by going to Control Panel or Settings to configure.',
  NOTIFI_PERMISSION_BLOCK_LOCATION_ANDROID_TEXT:
    'Bluezone kh??ng th??? ghi nh???n c??c "ti???p x??c g???n" v?? thi???t b??? ch??a B???t v??? tr??.\n\nBluezone ch??? s??? d???ng Bluetooth n??ng l?????ng th???p BLE ????? ghi nh???n c??c "ti???p x??c g???n". Tuy nhi??n, theo ch??nh s??ch c???a Google, khi b???t Bluetooth BLE thi???t b??? s??? t??? ?????ng ????? ngh??? truy c???p v??? tr?? thi???t b???, ngay c??? khi Bluezone kh??ng s??? d???ng t???i quy???n ????.\n\nB???n c???n c???p quy???n B???t v??? tr?? b???ng c??ch v??o "C??i ?????t / ???ng d???ng / Bluezone / Quy???n"',
  NOTIFI_PERMISSION_BLOCK_LOCATION_ANDROID_TEXT_en:
    'Bluezone cannot record "close contact" because the device has not turned on Location.\n\nBluezone only turns on Bluetooth Low Energy (BLE) to record "close contact". However, according to Google policy, when BLE is turned on the device will automatically offer the access to device location, even if Bluezone does not use that permission.\n\nYou need to accept the permission to turn on location by going to "Settings / Applications / Bluezone / Permissions".',
  NOTIFI_PERMISSION_WRITE_FILE_BLOCK_TEXT:
    'Bluezone kh??ng th??? ghi nh???n c??c "ti???p x??c g???n" v?? thi???t b??? ch??a B???t quy???n truy c???p t???p.\n\nM???c d?? v???y, theo ch??nh s??ch c???a Google, thi???t b??? v???n t??? ?????ng ????? ngh??? "cho ph??p truy c???p v??o ???nh, ph????ng ti???n v?? t???p" ngay c??? khi Bluezone kh??ng s??? d???ng c??c quy???n c??n l???i.\n\nB???n c???n c???p quy???n B???t l??u tr??? b???ng c??ch v??o "C??i ?????t / ???ng d???ng / Bluezone / Quy???n"',
  NOTIFI_PERMISSION_WRITE_FILE_BLOCK_TEXT_en:
    'Bluezone cannot record "close contact" because the device has not enabled access to file.\n\nHowever, according to Google policy, the device automatically recommends "access to photos, media and files??? even if Bluezone does not use the two first permissions.\n\nYou need to accept the permissions to enable storage by going to "Settings / pplications / Bluezone / Permissions".',
  LinkGroupFace: 'http://facebook.com/groups/bluezonevn',
  LinkGroupFace_en: 'http://facebook.com/groups/bluezonevn',
  TimeEnableBluetooth: 300000,
  BatteryEnableBluetooth: 15,
  Notifications: [],
  PermissonNotificationsAndroid: [],
  PermissonNotificationsIos: [],
  Language: null,
  ScheduleNotifyDay: 1,
  ScheduleNotifyHour: [8, 13, 20],
  TimeCountDownOTP: 180,

  // L??u g???i AsyncStorage
  UserCode: '',
  TokenFirebase: '',
  Register_Phone: 'FirstOTP',
  FirstOTP: null,
  StatusNotifyRegister: null,
  PhoneNumber: '',
};

const getConfigurationAsync = async () => {
  AsyncStorage.multiGet([
    'Configuration',
    'TokenFirebase',
    'Language',
    'FirstOTP',
    'StatusNotifyRegister',
    'PhoneNumber',
  ]).then(results => {
    let keys = {};
    results.forEach(result => {
      Object.assign(keys, {[result[0]]: result[1]});
    });

    const {
      Configuration,
      TokenFirebase,
      Language,
      FirstOTP,
      StatusNotifyRegister,
      PhoneNumber,
    } = keys;
    const configObject = JSON.parse(Configuration || '{}');

    mergeConfiguration(
      configObject,
      TokenFirebase,
      Language,
      FirstOTP,
      StatusNotifyRegister,
      PhoneNumber,
    );
  });
};

const mergeConfiguration = (
  configObject,
  TokenFirebase,
  Language,
  FirstOTP,
  StatusNotifyRegister,
  PhoneNumber,
) => {
  Object.assign(configuration, configObject, {
    TokenFirebase: TokenFirebase || '',
    Language: Language || 'vi',
    FirstOTP: FirstOTP || null,
    StatusNotifyRegister: StatusNotifyRegister || null,
    PhoneNumber: PhoneNumber || '',
  });
};

const getUserCodeAsync = async () => {
  const UserCode = await AsyncStorage.getItem('UserCode');
  if (validateUserCode(UserCode)) {
    Service.setUserId(UserCode);
    Object.assign(configuration, {
      UserCode: UserCode,
    });
    // Platform.OS !== 'ios' && saveUserToFile(UserCode);
    Platform.OS !== 'ios' && removeFileSaveUser();
  } else {
    // Service.restoreDb();
    // getUserIdFromFile(getUserIdFromFileCallback);
    getUserIdFromFileCallback();
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
  // Platform.OS !== 'ios' && saveUserToFile(userCode);
};

function notifySchedule(notify, timestamp) {
  const isVietnamese =
    !configuration.Language || configuration.Language === 'vi';
  PushNotification.localNotificationSchedule({
    /* Android Only Properties */
    id: notify.id,
    largeIcon: 'icon_bluezone_null',
    smallIcon: 'icon_bluezone_service',
    bigText: isVietnamese ? notify.bigText : notify.bigText_en,
    subText: isVietnamese ? notify.subText : notify.subText_en,
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
    title: isVietnamese ? notify.title : notify.title_en,
    message: isVietnamese ? notify.message : notify.message_en,
    playSound: false,
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

const createNotifyPermission = () => {
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

    const isVietnamese =
      !configuration.Language || configuration.Language === 'vi';

    PushNotification.localNotificationSchedule({
      /* Android Only Properties */
      id: notify.id,
      largeIcon: 'icon_bluezone_null',
      smallIcon: 'icon_bluezone_service',
      bigText: isVietnamese ? notify.bigText : notify.bigText_en,
      subText: isVietnamese ? notify.subText : notify.subText_en,
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
      title: isVietnamese ? notify.title : notify.title_en,
      message: isVietnamese ? notify.message : notify.message_en,
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
    error => {
      errorCb(error);
    },
  );
};

// L??u s??? ??i???n tho???i
const setPhoneNumber = PhoneNumber => {
  Object.assign(configuration, {PhoneNumber});
  if (PhoneNumber) {
    AsyncStorage.setItem('PhoneNumber', PhoneNumber); // TODO by NhatPA: ??ang x???y ra tr?????ng h???p null
  }
};

// L??u th??ng tin TokenFirebase
const setTokenFirebase = TokenFirebase => {
  if (
    configuration.TokenFirebase !== '' &&
    TokenFirebase === configuration.TokenFirebase
  ) {
    return;
  }
  if (configuration.TokenFirebase === '') {
    registerUser(TokenFirebase);
  } else {
    updateTokenFirebase(TokenFirebase, configuration.TokenFirebase);
  }
};

const registerUser = async (TokenFirebase, successCb, errorCb, timeRetry) => {
  TIME_RETRY = timeRetry ? timeRetry : TIME_RETRY;
  if (REGISTER_USER_RUNNING || configuration.TokenFirebase) {
    return;
  }
  REGISTER_USER_RUNNING = true;
  // Check n???u ??ang setTimeOut m?? v??o app ??? tr???ng th??i forground th?? clearTimeout.
  // if (timerRegister) {
  //   CURRENT_RETRY = 0;
  //   clearTimeout(timerRegister);
  // }

  const options = {
    method: 'post',
    data: {
      TokenFirebase: TokenFirebase,
    },
    url: `${DOMAIN}/api/App/RegisterUser`,
  };

  axios(options).then(
    response => {
      REGISTER_USER_RUNNING = false;
      if (response && response.status === 200 && response.data.isOk === true) {
        successCb && successCb(response.data);
        timerRegister && clearTimeout(timerRegister);
        Object.assign(configuration, {TokenFirebase});
        AsyncStorage.setItem('TokenFirebase', TokenFirebase);
      }
    },
    error => {
      REGISTER_USER_RUNNING = false;
      // Start kich ban thu lai lien tuc toi khi duoc
      timerRegister && clearTimeout(timerRegister);
      if (CURRENT_RETRY < TIME_RETRY.length) {
        timerRegister = setTimeout(
          () => registerUser(TokenFirebase, successCb, errorCb, timeRetry),
          TIME_RETRY[CURRENT_RETRY],
        );
        CURRENT_RETRY++;
      } else {
        errorCb && errorCb(error);
        CURRENT_RETRY = 0;
      }
    },
  );
};

const updateTokenFirebase = (TokenFirebase, TokenFirebaseOld) => {
  if (UPDATE_TOKEN_FIREBASE_RUNNING) {
    return;
  }
  UPDATE_TOKEN_FIREBASE_RUNNING = true;

  // Option g???i server.
  const options = {
    method: 'post',
    data: {
      TokenFirebase: TokenFirebase,
      TokenFirebaseOld: TokenFirebaseOld,
    },
    url: `${DOMAIN}/api/App/UpdateTokenFirebase`,
  };

  axios(options).then(
    response => {
      UPDATE_TOKEN_FIREBASE_RUNNING = false;
      if (response && response.status === 200 && response.data.isOk === true) {
        timerUpdateToken && clearTimeout(timerUpdateToken);
        Object.assign(configuration, {TokenFirebase: TokenFirebase});
        AsyncStorage.setItem('TokenFirebase', TokenFirebase);
      }
    },
    error => {
      UPDATE_TOKEN_FIREBASE_RUNNING = false;
      timerUpdateToken && clearTimeout(timerUpdateToken);
      if (
        CURRENT_RETRY_UPDATE_TOKEN_FCM < TIME_RETRY_UPDATE_TOKEN_FIREBASE.length
      ) {
        timerUpdateToken = setTimeout(
          updateTokenFirebase,
          TIME_RETRY_UPDATE_TOKEN_FIREBASE[CURRENT_RETRY_UPDATE_TOKEN_FCM],
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

// L??u th??ng tin Language
const setLanguage = Language => {
  Object.assign(configuration, {Language});
  AsyncStorage.setItem('Language', Language);
  Platform.OS === 'android' && NativeModules.TraceCovid.setLanguage(Language);
};

const setStatusNotifyRegister = StatusNotifyRegister => {
  Object.assign(configuration, {StatusNotifyRegister});
  AsyncStorage.setItem('StatusNotifyRegister', StatusNotifyRegister);
};

const checkNotifyOfDay = () => {
  let {
    ScheduleNotifyDay, // Gi?? tr??? s??? ng??y ????? hi???n th??? th??ng b??o.
    ScheduleNotifyHour, // Khung gi??? nh???c trong ng??y VD: [8, 13, 20].
    StatusNotifyRegister, // Th???i gian cu???i c??ng hi???n th??? th??ng b??o.
    PhoneNumber,
    TokenFirebase,
  } = configuration;

  // Tr?????ng h???p ng?????i d??ng khai b??o OTP l???n ?????u v??o app;
  if (PhoneNumber || !TokenFirebase) {
    return false;
  }

  // Tr?????ng h???p ng?????i d??ng "b??? qua" l???n ?????u v??o app th?? s??? cho hi???n th??? notify cho app.
  if (!StatusNotifyRegister) {
    return true;
  }

  const date = new Date();
  const currentTimeOfHours = date.getHours();
  const Time_ScheduleNotify = ScheduleNotifyDay * 86400000;
  StatusNotifyRegister = parseInt(StatusNotifyRegister || new Date().getTime());
  const currentTimeOfDay = date.setHours(0, 0, 0, 0);
  const StatusNotifyRegisterForHour = new Date(StatusNotifyRegister).setHours(
    0,
    0,
    0,
    0,
  );

  // Check tr???ng th??i ?????n ng??y notify
  const checkDay =
    currentTimeOfDay === StatusNotifyRegisterForHour + Time_ScheduleNotify;

  // Check tr?????ng h???p ?????n ng??y notify
  // + Tr?????ng h???p 1: Ng??y + Th???i gian hi???n t???i nh??? h??n s??? gi??? ?????u.
  // + Tr?????ng h???p 2: Tr???ng th??i cu???i c??ng hi???n th??? notify c???a ng??y.
  if (
    (checkDay && currentTimeOfHours < ScheduleNotifyHour[0]) ||
    (currentTimeOfDay === StatusNotifyRegisterForHour &&
      currentTimeOfHours < ScheduleNotifyHour[0])
  ) {
    return false;
  }

  // Check tr?????ng h???p hi???n th??? ??? c??c khung gi??? kh??c nhau.
  const hoursOld = new Date(StatusNotifyRegister).getHours();
  for (let i = 0; i < ScheduleNotifyHour.length; i++) {
    if (
      i === ScheduleNotifyHour.length - 1 &&
      ScheduleNotifyHour[ScheduleNotifyHour.length - 1] <= hoursOld
    ) {
      return false;
    }
    if (
      ScheduleNotifyHour[i] <= hoursOld &&
      ScheduleNotifyHour[i + 1] >= hoursOld &&
      ScheduleNotifyHour[i] <= currentTimeOfHours &&
      ScheduleNotifyHour[i + 1] >= currentTimeOfHours
    ) {
      return false;
    }
  }
  return true;
};

export default configuration;
export {
  setTokenFirebase,
  getConfigurationAPI,
  getConfigurationAsync,
  getUserCodeAsync,
  getConfig,
  registerUser,
  removeNotifyPermisson,
  createNotifyPermission,
  setLanguage,
  setStatusNotifyRegister,
  checkNotifyOfDay,
  setPhoneNumber,
};
