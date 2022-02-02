/**
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

(function() {
  'use strict';

  /**
   * @ngdoc model
   * @name horizon.dashboard.barbican.secrets.model
   * @description Service for the secret model
   */
  angular
    .module('horizon.dashboard.barbican.secrets')
    .factory('horizon.dashboard.barbican.secrets.model', model);

  model.$inject = [];

  function model() {
    var model = {
      spec: {},
      init: init,
      cleanProperties: cleanProperties
    };

    function init() {
      model.spec = {
        id: '',
        name: ''
      };
    }

    function cleanProperties() {
      var customProperties = {};
      Object.keys(model.spec).forEach(function(customKey) {
        if(customKey.startsWith('custom')) {
          var key = customKey.replace('custom', '');
          if (model.spec[key] == 'custom') {
            customProperties[key] = model.spec[customKey];
          }
          delete model.spec[customKey];
        }
      });

      model.spec = Object.assign(model.spec, customProperties);

      if(
        'payloadContentType' in model.spec &&
        model.spec.payloadContentType == 'application/octet-stream'
      ) {
        model.spec.payload = model.spec.payloadFile;
        model.spec.payload_content_encoding = 'base64';
        delete model.spec.payloadFile;
      }

      if('expirationDate' in model.spec && 'expirationTime' in model.spec) {
        var dateInput = new Date(model.spec.expirationDate);
        var timeInput = new Date(model.spec.expirationTime);

        dateInput.setHours(timeInput.getHours(), timeInput.getMinutes(), timeInput.getSeconds(), 0);

        model.spec.expiration = dateInput.toISOString();
      }

      delete model.spec.expirationDate;
      delete model.spec.expirationTime;

      delete model.spec.id;
      delete model.spec.custom;

      if('bitLength' in model.spec) {
        model.spec.bitLength = parseInt(model.spec.bitLength);
      }

      Object.keys(model.spec).forEach(function(key) {
        if(model.spec[key] == '' || Number.isNaN(model.spec[key])) {
          delete model.spec[key];
        }
      });
    }
    return model;
  }
})();
