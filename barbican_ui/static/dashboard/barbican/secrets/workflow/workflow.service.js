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

  /**
   * @ngdoc workflow
   * @name horizon.dashboard.barbican.secrets.workflow
   * @description Service for the create/update workflow
   */
  angular
    .module('horizon.dashboard.barbican.secrets')
    .factory('horizon.dashboard.barbican.secrets.workflow', workflow);

  workflow.$inject = [
    'horizon.dashboard.barbican.basePath',
    'horizon.framework.util.i18n.gettext',
    'horizon.framework.widgets.form.ModalFormService',
    'horizon.dashboard.barbican.offerdValues',
    'horizon.dashboard.barbican.secrets.workflow.schemaFactory',
    'horizon.dashboard.barbican.secrets.workflow.formFactory'
  ];

  function workflow(basePath, gettext, modal, offerdValues, schemaFactory, formFactory) {

    var workflow = {
      initCreate: initCreate,
      initUpdate: initUpdate
    };

    function initCreate(title, submitText, submitIcon, model) {
      return init(title, submitText, submitIcon, model, 'create');
    }

    function initUpdate(title, submitText, submitIcon, model) {
      return init(title, submitText, submitIcon, model, 'update');
    }

    function init(title, submitText, submitIcon, model, mode) {
      var config = {
        'title': title,
        'submitText': submitText,
        'schema': schemaFactory.init(mode),
        'form': formFactory.init(model, mode),
        'model': model
      };
      return modal.open(config);
    }
    return workflow;
  }
})();
