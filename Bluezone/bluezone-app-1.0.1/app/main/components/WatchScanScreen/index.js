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

import React from 'react';
import 'moment/locale/vi';

// Components
import {
  SafeAreaView,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import Header from '../../../base/components/Header';
import Text, {MediumText} from '../../../base/components/Text';

// Config
import configuration from '../../../Configuration';

// Styles
import styles from './styles/index.css';

// Api
import Service from '../../../apis/service';

class WatchScanScreen extends React.Component {
  constructor(props) {
    super(props);
    const {logs, mapDevice} = this.creatLog();
    this.state = {
      logs: logs || [],
    };
    this.mapDevice = mapDevice || {};
  }

  componentDidMount() {
    this.scanBLEListener = Service.addListenerScanBLE(this.onScan);
    if (Platform.OS !== 'ios') {
      this.scanBlueToothListener = Service.addListenerScanBlueTooth(
        this.onScan,
      );
    }
  }

  componentWillUnmount() {
    this.scanBLEListener && this.scanBLEListener.remove();
    this.scanBlueToothListener && this.scanBlueToothListener.remove();
    const keys = Object.keys(this.mapDevice);
    for (var i = 0; i < keys.length; i++) {
      clearTimeout(this.mapDevice[keys[i]].timmer);
      delete this.mapDevice[keys[i]];
    }
  }

  creatLog = () => {
    const {TimeShowLog} = configuration;
    const {route} = this.props;
    const logsNavigation = (route && route.params.logs) || [];
    const logs = [];
    const mapDevice = {};

    logsNavigation.forEach(log => {
      const keyMap =
        log.userId && log.userId.length > 0
          ? log.userId
          : log.name + '@' + log.address;
      logs.push({
        id: keyMap,
        // timestamp: moment().format("DD/MM/YYYY HH:mm:ss"),
        userId: log.userId,
        name: log.name,
        address: log.address,
        platform: log.platform,
        type: this.getTypeRSSI(log.rssi),
        rssi: log.rssi,
      });

      // T???o timmer
      const timmer = setTimeout(() => {
        // console.log('delele ' + new Date().getTime() + ' ' + keyMap);
        delete this.mapDevice[keyMap];
        // X??a kh???i danh s??ch thi???t b???
        this.setState(prevState => {
          const logsTemp = prevState.logs;
          for (let i = 0; i < logsTemp.length; i++) {
            if (
              logsTemp[i].userId === log.userId &&
              logsTemp[i].name === log.name &&
              logsTemp[i].address === log.address
            ) {
              logsTemp.splice(i, 1);
            }
          }

          return {
            logs: [...logsTemp],
          };
        });
      }, TimeShowLog);

      mapDevice[keyMap] = {
        timmer,
        time: new Date().getTime(),
      };
    });

    return {
      logs,
      mapDevice,
    };
  };

  onBack = () => {
    this.props.navigation.goBack();
    return true;
  };

  getTypeRSSI = rssi => {
    const {RssiThreshold} = configuration;
    return rssi && rssi >= RssiThreshold ? 1 : 0;
  };

  onScan = ({id, name = '', address = '', rssi, platform, typeScan}) => {
    const {TimeShowLog} = configuration;
    const {logs} = this.state;

    const keyMap = id && id.length > 0 ? id : name + '@' + address;
    // console.log(new Date().getTime() + ': ' + keyMap);
    const typeRSSI = this.getTypeRSSI(rssi);

    if (this.mapDevice[keyMap]) {
      // X??a timmer c??
      clearTimeout(this.mapDevice[keyMap].timmer);
      delete this.mapDevice[keyMap];
    }

    let hasDevice = false;
    let typeList;
    let indexDevice;
    for (let i = 0; i < logs.length; i++) {
      if (
        logs[i].userId === id &&
        logs[i].name === name &&
        logs[i].address === address
      ) {
        hasDevice = true;
        indexDevice = i;
        typeList = logs[i].type;
      }
    }

    if (!hasDevice) {
      // Th??m v??o danh s??ch
      // console.log('add ' + new Date().getTime() + ' ' + keyMap);
      this.setState(prevState => {
        return {
          logs: [
            ...prevState.logs,
            {
              id: keyMap,
              userId: id,
              name: name,
              address: address,
              platform,
              type: typeRSSI,
              typeScan,
              rssi: rssi,
            },
          ],
        };
      });
    } else if (hasDevice && typeList !== typeRSSI) {
      // S???a l???i danh s??ch
      logs[indexDevice].type = typeRSSI;
      logs[indexDevice].rssi = rssi;
      console.log('changeType' + new Date().getTime() + ' ' + keyMap);
      this.setState(prevState => {
        return {
          logs: [...logs],
        };
      });
    }

    // Th??m timmer
    const timmer = setTimeout(() => {
      delete this.mapDevice[keyMap];
      // X??a kh???i danh s??ch thi???t b???
      this.setState(prevState => {
        const logsTemp = prevState.logs;
        for (let i = 0; i < logsTemp.length; i++) {
          if (
            logsTemp[i].userId === id &&
            logsTemp[i].name === name &&
            logsTemp[i].address === address
          ) {
            logsTemp.splice(i, 1);
          }
        }

        return {
          logs: [...logsTemp],
        };
      });
    }, TimeShowLog);

    this.mapDevice[keyMap] = {
      timmer,
      time: new Date().getTime(),
    };
  };

  onInvite = () => {
    this.props.navigation.navigate('Invite', {header: true});
  };

  buttonInvite = userId => {
    if (userId) {
      return (
        <View style={styles.inviteButtonContainer}>
          <FastImage
            source={require('./styles/images/bluezoner.png')}
            style={styles.buttonInvite}
          />
        </View>
      );
    }
    return (
      <TouchableOpacity
        style={styles.inviteButtonContainer}
        onPress={this.onInvite}>
        <View style={styles.inviteButton}>
          <Text style={styles.inviteText}>M???i</Text>
        </View>
      </TouchableOpacity>
    );
  };

  renderItemLog = item => {
    const content = item.userId
      ? `${item.userId}`
      : `${item.name} (${item.address})`;
    return (
      <View key={item.id} style={styles.listItemContainer}>
        <Text numberOfLines={1} style={styles.contentScan}>
          {content}
        </Text>
        {this.buttonInvite(item.userId)}
      </View>
    );
  };

  render() {
    const {UserCode} = configuration;
    const {logs} = this.state;

    const itemsLogNear = [];
    const itemsLogDiff = [];

    logs.forEach(log => {
      if (log.type === 1) {
        itemsLogNear.push(log);
      } else {
        itemsLogDiff.push(log);
      }
    });

    let countBlueZone = 0;
    logs.forEach(log => {
      if (log.userId && log.userId.length > 0) {
        countBlueZone++;
      }
    });

    return (
      <SafeAreaView style={styles.container}>
        <Header
          onBack={this.onBack}
          styleTitle={styles.titleHeader}
          styleHeader={styles.header}
          colorIcon="#015CD0"
          showBack
          title={'Qu??t xung quanh'}
        />
        <ScrollView>
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <View style={styles.infoAround}>
                <View style={styles.infoAround1}>
                  <Text style={styles.infoItemValue}>{logs.length}</Text>
                </View>
              </View>
              <Text style={styles.infoItemDesc}>Xung quanh b???n</Text>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoBluezone}>
                <View style={styles.infoBluezone1}>
                  <Text style={styles.infoItemValue}>{countBlueZone}</Text>
                </View>
              </View>
              <Text style={styles.infoItemDesc}>Bluezoner</Text>
            </View>
          </View>

          <View>
            <View style={styles.listContainer}>
              <View style={styles.listHeaderContainer}>
                <MediumText style={styles.textListHeader}>??? g???n b???n</MediumText>
                <MediumText style={styles.textListHeaderValue}>
                  {itemsLogNear.length}
                </MediumText>
              </View>
              {itemsLogNear.length > 0 ? (
                <View style={styles.listBodyContainer}>
                  {itemsLogNear.map(item => {
                    return this.renderItemLog(item);
                  })}
                </View>
              ) : (
                <View style={styles.listEmptyContainer}>
                  <View style={styles.listEmptyCircle}>
                    <FastImage
                      source={require('./styles/images/ic_list.png')}
                      style={styles.iconEmpty}
                    />
                  </View>
                  <Text style={styles.listEmptyText}>Danh s??ch tr???ng</Text>
                </View>
              )}
            </View>
            <View style={styles.listContainer}>
              <View style={styles.listHeaderContainer}>
                <MediumText style={styles.textListHeader}>
                  ??? xung quanh
                </MediumText>
                <MediumText style={styles.textListHeaderValue}>
                  {itemsLogDiff.length}
                </MediumText>
              </View>
              {itemsLogDiff.length > 0 ? (
                <View style={styles.listBodyContainer}>
                  {itemsLogDiff.map(item => {
                    return this.renderItemLog(item);
                  })}
                </View>
              ) : (
                <View style={styles.listEmptyContainer}>
                  <View style={styles.listEmptyCircle}>
                    <FastImage
                      source={require('./styles/images/ic_list.png')}
                      style={styles.iconEmpty}
                    />
                  </View>
                  <Text style={styles.listEmptyText}>Danh s??ch tr???ng</Text>
                </View>
              )}
            </View>
            <View style={styles.listHeaderContainer}>
              <MediumText style={styles.textListHeader}>
                M?? Bluezone ID c???a b???n
              </MediumText>
              <MediumText style={styles.textUserCode}>{UserCode}</MediumText>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
}

export default WatchScanScreen;
