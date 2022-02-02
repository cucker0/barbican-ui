/*
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() {
  "use strict";

  angular
    .module('horizon.dashboard.barbican.secrets')
    .controller('horizon.dashboard.barbican.secrets.OverviewController', controller);

  controller.$inject = [
    '$scope',
    'horizon.app.core.openstack-service-api.barbican',
    'horizon.framework.widgets.toast.service'
  ];

  function controller(
    $scope,
    api,
    toastService
  ) {
    var ctrl = this;
    ctrl.secret = {};
    ctrl.showSecret = false;

    $scope.context.loadPromise.then(function (secret) {
      ctrl.secret = secret.data;
      ctrl.secret.payload = null;

      if (ctrl.secret.payload_content_type == 'text/plain') {
        api.getPayload(ctrl.secret.id).then(function(response) {
          if (response.data.payload) {
            ctrl.secret.payload = response.data.payload;
          }
        });
      }
    });

    $scope.toggleSecretVisibility = function() {
      ctrl.showSecret = !ctrl.showSecret;
    };

    $scope.copyToClipboard = function() {
      var copyText = document.getElementById("secret-payload");
      copyText.select();
      copyText.setSelectionRange(0, 99999);
      document.execCommand('copy');
      copyText.setSelectionRange(0, 0);
      toastService.add('success', interpolate("Copied the secret to your clipboard", { }, true));
    };
  }
})();
