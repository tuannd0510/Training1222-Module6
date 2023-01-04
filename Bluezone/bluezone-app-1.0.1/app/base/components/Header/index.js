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

// Compoenents
import {TouchableOpacity, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {MediumText} from '../Text';

// Styles
import styles from './styles/index.css';

function Index(props) {
  const {onBack, showBack, title, styleHeader, styleTitle, colorIcon} = props;
  return (
    <View style={[styles.container, styleHeader]}>
      {showBack && (
        <TouchableOpacity onPress={onBack} style={styles.btnBack}>
          <Ionicons
            name={'md-arrow-back'}
            size={25}
            style={styles.icon}
            color={colorIcon}
          />
        </TouchableOpacity>
      )}
      <View style={styles.title}>
        <MediumText style={[styles.textTitle, styleTitle]}>{title}</MediumText>
      </View>
    </View>
  );
}

Index.defaultProps = {
  colorIcon: '#FFF',
};

export default Index;
