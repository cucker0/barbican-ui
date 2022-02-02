/**
 * Licensed under the Apache License, Version 2.0 (the 'License'); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

(function() {
  'use strict';

  /**
   * @ngdoc overview
   * @name horizon.dashboard.barbican.secrets.update.service
   * @description Service for the secret update modal
   */
  angular
    .module('horizon.dashboard.barbican.secrets')
    .factory('horizon.dashboard.barbican.secrets.update.service', updateService);

  updateService.$inject = [
    '$location',
    'horizon.app.core.openstack-service-api.barbican',
    'horizon.app.core.openstack-service-api.policy',
    'horizon.framework.util.actions.action-result.service',
    'horizon.framework.util.i18n.gettext',
    'horizon.framework.util.q.extensions',
    'horizon.framework.widgets.toast.service',
    'horizon.dashboard.barbican.secrets.events',
    'horizon.dashboard.barbican.secrets.model',
    'horizon.dashboard.barbican.secrets.resourceType',
    'horizon.dashboard.barbican.secrets.workflow',
    'horizon.dashboard.barbican.offerdValues'
  ];

  function updateService(
    $location, api, policy, actionResult, gettext, $qExtensions,
    toast, events, model, resourceType, workflow, offerdValues
  ) {

    var message = {
      success: gettext('Secret %s was successfully updated.')
    };

    var service = {
      initAction: initAction,
      perform: perform,
      allowed: allowed
    };

    var id;

    return service;

    function initAction() {}

    /* eslint-disable no-unused-vars */
    function perform(selected) {
      // modal title, buttons
      var title, submitText, submitIcon;
      title = gettext('Update Secret');
      submitText = gettext('Update');
      submitIcon = 'fa fa-check';
      model.init();

      // load current data
      id = selected.id;
      var deferred = api.getSecret(id);
      deferred.then(onLoad);

      function onLoad(response) {
        model.spec.id = response.data.id;
        model.spec.name = response.data.name;
        model.spec.mode = response.data.mode;
        model.spec.payload_content_encoding = response.data.payload_content_encoding;
        model.spec.payload_content_type = response.data.payload_content_type;
        model.spec.secret_type = response.data.secret_type;
        model.spec.bit_length = response.data.bit_length;
        model.spec.algorithm = response.data.algorithm;

        if(model.spec.bit_length != null && !(model.spec.bit_length in offerdValues.bitLength)) {
          model.spec.custom_bit_length = model.spec.bit_length;
          model.spec.bit_length = 'custom';
        }

        if(model.spec.bit_length == null) {
          model.spec.bit_length = '';
        }

        if(model.spec.algorithm != null && !(model.spec.algorithm in offerdValues.algorithm)) {
          model.spec.custom_algorithm = model.spec.algorithm;
          model.spec.algorithm = 'custom';
        }

        if(model.spec.algorithm == null) {
          model.spec.algorithm = '';
        }

        if(model.spec.mode != null && !(model.spec.mode in offerdValues.mode)) {
          model.spec.custom_mode = model.spec.mode;
          model.spec.mode = 'custom';
        }

        if(model.spec.mode == null) {
          model.spec.mode = '';
        }

        if(model.spec.expiration != null) {
          var expirationDate = new Date(model.spec.expiration);
          model.spec.expiration_date = expirationDate;
          model.spec.expiration_time = expirationDate;
        }
      }

      var result = workflow.initUpdate(title, submitText, submitIcon, model.spec);
      return result.then(submit);
    }

    function allowed() {
      return $qExtensions.booleanAsPromise(true);
      // fixme: if you need to set policy, change as follow
      //return policy.ifAllowed({ rules: [['secret', 'update_secret']] });
    }

    function submit() {
      model.cleanProperties();
      return api.updateSecret(id, model.spec).then(success);
    }

    function success(response) {
      response.data.id = response.data.uuid;
      toast.add('success', interpolate(message.success, [response.data.id]));
      var result = actionResult.getActionResult()
                   .updated(resourceType, response.data.id);
      if (result.result.failed.length === 0 && result.result.updated.length > 0) {
        $location.path('/project/secrets');
      } else {
        return result.result;
      }
    }
  }
})();
