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

import * as React from 'react';
import {BluetoothStatus} from 'react-native-bluetooth-status';

// Components
import Modal from 'react-native-modal';
import {Dimensions, View, AppState, Linking, Platform} from 'react-native';
import ModalBase from './ModalBase';
import Text, {MediumText} from '../../../base/components/Text';
import ButtonText from '../../../base/components/ButtonText';
import {getCheckVersions} from '../../../apis/bluezone';
import getStatusUpdate from '../../../utils/getStatusUpdate';

import {PERMISSIONS, requestMultiple} from 'react-native-permissions';
import {requestUserPermission} from '../../../CloudMessaging';
import configuration, {
  removeNotifyPermisson,
  createNotifyPermisson,
  getUserCodeAsync,
} from '../../../Configuration';

// Styles
import styles from './styles/index.css';

class ModalNotify extends React.Component {
  constructor(props) {
    super(props);
    const {height} = Dimensions.get('window');
    this.state = {
      height,
      blueTooth: false,
      isVisiblePermissionBLE: false,
      isVisibleBLE: false,

      isModalLocation: false,
      isModalUpdate: false,
      forceUpdate: false,

      isVisibleNotify: false,
    };

    this.handleAppStateChange = this.handleAppStateChange.bind(this);
    this.onChangeBluetooth = this.onChangeBluetooth.bind(this);
    this.onCheckUpdate = this.onCheckUpdate.bind(this);
    this.onTurnOnPermissionBLE = this.onTurnOnPermissionBLE.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
    this.onCancelUpdate = this.onCancelUpdate.bind(this);
    this.checkRequestMultiple = this.checkRequestMultiple.bind(this);
    this.onTurnOnBLE = this.onTurnOnBLE.bind(this);
    this.onTurnOnNotify = this.onTurnOnNotify.bind(this);
    this.requestNotifications = this.requestNotifications.bind(this);

    this.isPermissionBluetooth = false;
    this.statusBluetooth = '';
    this.isPermissionNotify = 0;
    this.vesionIOS = parseInt(Platform.Version, 10);
  }

  componentDidMount() {
    // Check Version
    this.onCheckUpdate();

    getUserCodeAsync();

    // BluetoothStatus
    this.checkRequestMultiple();
    BluetoothStatus.addListener(listener => {
      this.setStatusBluetooth(listener);
    });

    AppState.addEventListener('change', this.handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange(appState) {
    if (appState === 'active') {
      this.onChangeBluetooth();
      this.onCheckUpdate();

      if (
        this.statusBluetooth === 'granted' ||
        (this.statusBluetooth === 'unavailable' &&
          !this.state.isVisiblePermissionBLE) ||
        (this.statusBluetooth === 'blocked' &&
          !this.state.isVisiblePermissionBLE)
      ) {
        // ??i???u ki???n n??y ch??? ????? ?????m b???o k???ch b???n xin quy???n b??? nh??? ???? k???t th??c th?? m???i l??m vi???c ti???p theo
        if (
          this.statusWrite === 'granted' ||
          (this.statusWrite === 'unavailable' &&
            !this.state.isPermissionNotify) ||
          (this.statusWrite === 'blocked' && !this.state.isPermissionNotify)
        ) {
          getUserCodeAsync();
        }
      }
    }
  }

  checkRequestMultiple() {
    requestMultiple([PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL]).then(statuses => {
      const permissionBluetooth =
        statuses[PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL];
      // Check trang thai khi t??? background sang foreground th?? s??? kh??ng hi???n thi popup c??i ?????t n???a, ch??? cho hi???n th??? v??o l??c l???n ?????u.

      console.log('permissionBluetooth', permissionBluetooth);
      this.statusBluetooth = permissionBluetooth;
      switch (permissionBluetooth) {
        case 'blocked':
          if (!this.isPermissionBluetooth) {
            this.setState({isVisiblePermissionBLE: true});
            this.isPermissionBluetooth = true;
            createNotifyPermisson();
          }
          break;
        case 'granted':
          removeNotifyPermisson();
          requestUserPermission(this.requestNotifications);
          break;
        default:
          break;
      }
    });
  }

  requestNotifications(status) {
    if (status !== 1) {
      this.setState({isVisibleNotify: true});
    }
    this.isPermissionNotify = status;
    this.onChangeBluetooth();
  }

  async onChangeBluetooth() {
    const isEnabled = await BluetoothStatus.state();
    this.setStatusBluetooth(isEnabled);
  }

  setStatusBluetooth = status => {
    this.props.onChangeBlue(status);
    console.log('aaaaaaa', this.vesionIOS < 13);
    if (this.vesionIOS < 13) {
      this.setState({isVisibleBLE: !status});
    }
  };

  onCheckUpdate() {
    getCheckVersions(
      response => {
        const statusUpdate = getStatusUpdate(
          response.VersionIOS,
          response.forceUpdateIOS,
          response.recommendedUpdateIOS,
        );
        this.urlUpdate = response.LinkShareIOS;
        if (statusUpdate !== 0) {
          this.urlUpdate &&
            this.urlUpdate.length > 0 &&
            this.setState({
              isModalUpdate: true,
              forceUpdate: statusUpdate === 1,
            });
        }
      },
      () => {},
    );
  }

  onTurnOnPermissionBLE() {
    this.setState({isVisiblePermissionBLE: false});
    Linking.canOpenURL('app-settings:')
      .then(supported => {
        if (!supported) {
          console.log("Can't handle settings url");
        } else {
          return Linking.openURL('app-settings:');
        }
      })
      .catch(err => console.error('An error occurred', err));
  }

  onTurnOnBLE() {
    this.setState({isVisibleBLE: false});
    Linking.canOpenURL('App-prefs:root=Bluetooth')
      .then(supported => {
        if (!supported) {
          console.log("Can't handle settings url");
        } else {
          return Linking.openURL('App-prefs:root=Bluetooth');
        }
      })
      .catch(err => console.error('An error occurred', err));
  }

  onUpdate() {
    this.setState({isModalUpdate: false, forceUpdate: false}, () => {
      this.urlUpdate && Linking.openURL(this.urlUpdate);
    });
  }

  onTurnOnNotify() {
    this.setState({isVisibleNotify: false});
    Linking.canOpenURL('app-settings://3')
      .then(supported => {
        if (!supported) {
          console.log("Can't handle settings url");
        } else {
          return Linking.openURL('app-settings://3');
        }
      })
      .catch(err => console.error('An error occurred', err));
  }

  onCancelUpdate() {
    this.setState({isModalUpdate: false, forceUpdate: false});
  }

  render() {
    const {
      isVisiblePermissionBLE,
      isVisibleBLE,
      isModalUpdate,
      forceUpdate,
      isVisibleNotify,
    } = this.state;

    const {
      NOTIFI_BLE_IOS_TEXT,
      NOTIFI_PERMISSION_BLE_IOS_TEXT,
      NOTIFI_PERMISSION_TEXT,
    } = configuration;
    return (
      <View>
        <ModalBase
          isVisible={isVisiblePermissionBLE}
          content={NOTIFI_PERMISSION_BLE_IOS_TEXT}
          onPress={this.onTurnOnPermissionBLE}
        />
        <ModalBase
          isVisible={isVisibleBLE}
          content={NOTIFI_BLE_IOS_TEXT}
          onPress={this.onTurnOnBLE}
        />
        <ModalBase
          isVisible={isVisibleNotify}
          content={NOTIFI_PERMISSION_TEXT}
          onPress={this.onTurnOnNotify}
        />
        <Modal
          isVisible={isModalUpdate}
          style={styles.modal}
          animationIn="zoomInDown"
          animationOut="zoomOutUp"
          animationInTiming={400}
          animationOutTiming={400}
          backdropTransitionInTiming={400}
          backdropTransitionOutTiming={400}>
          <View style={styles.container}>
            <View style={styles.textDiv}>
              <MediumText style={styles.textTitle}>
                ???? c?? phi??n b???n m???i
              </MediumText>
              <Text style={styles.textCenterIOS}>
                B???n h??y c???p nh???t phi??n b???n m???i ????? s??? d???ng c??c t??nh n??ng m???i nh???t
              </Text>
            </View>
            <View style={styles.flexRow}>
              {!forceUpdate && (
                <ButtonText
                  text={'B??? qua'}
                  onPress={this.onCancelUpdate}
                  styleText={styles.colorText}
                  styleBtn={styles.buttonCancel}
                />
              )}
              <ButtonText
                text={'C???p nh???t'}
                onPress={this.onUpdate}
                styleText={styles.colorText}
                styleBtn={styles.flex}
              />
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

export default ModalNotify;
