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
   * @ngdoc overview
   * @name horizon.dashboard.barbican.secrets
   * @ngModule
   * @description
   * Provides all the services and widgets require to display the Secret
   * panel
   */
  angular
    .module('horizon.dashboard.barbican.secrets', [
      'ngRoute',
      'horizon.dashboard.barbican.secrets.actions',
      'horizon.dashboard.barbican.secrets.details'
    ])
    .constant('horizon.dashboard.barbican.secrets.events', events())
    .constant('horizon.dashboard.barbican.secrets.resourceType', 'OS::Barbican::Secret')
    .run(run)
    .config(config);

  /**
   * @ngdoc constant
   * @name horizon.dashboard.barbican.secrets.events
   * @description A list of events used by Secret
   * @returns {Object} events
   */
  function events() {
    return {
      CREATE_SUCCESS: 'horizon.dashboard.barbican.secrets.CREATE_SUCCESS',
      DELETE_SUCCESS: 'horizon.dashboard.barbican.secrets.DELETE_SUCCESS'
    };
  }

  run.$inject = [
    'horizon.framework.conf.resource-type-registry.service',
    'horizon.dashboard.barbican.secrets.service',
    'horizon.dashboard.barbican.secrets.basePath',
    'horizon.dashboard.barbican.secrets.resourceType'
  ];

  function run(registry, service, basePath, resourceType) {
    registry.getResourceType(resourceType)
    .setNames(gettext('Secret'), gettext('Secrets'))
    // for detail summary view on table row
    .setSummaryTemplateUrl(basePath + 'details/drawer.html')
    // set default url for index view. this will be used for reproducing
    // sidebar and breadcrumb when refreshing or accessing directly
    // details view.
    .setDefaultIndexUrl('/barbican/secrets/')
    // specify items for table row items, summary view and details view
    .setProperties(properties())
    // get items for table
    .setListFunction(service.getPromise)
    // specify table columns
    .tableColumns
    .append({
      id: 'name',
      priority: 1,
      sortDefault: true,
      filters: ['noName'],
      urlFunction: service.urlFunction
    })
    .append({
      id: 'content_types',
      priority: 1,
      filters: ['noValue']
    })
    .append({
      id: 'algorithm',
      priority: 1,
      filters: ['noValue']
    })
    .append({
      id: 'bit_length',
      priority: 1,
      filters: ['noValue']
    })
    .append({
      id: 'status',
      priority: 1,
      filters: ['noValue']
    })
    .append({
      id: 'mode',
      priority: 2,
      filters: ['noValue']
    })
    .append({
      id: 'created',
      priority: 2
    })
    .append({
      id: 'updated',
      priority: 2
    })
    .append({
      id: 'expiration',
      priority: 2
    });

    // for magic-search
    registry.getResourceType(resourceType).filterFacets
    .append({
      'label': gettext('Name'),
      'name': 'name',
      'singleton': true
    })
    .append({
      'label': gettext('Base'),
      'name': 'base',
      'singleton': true
    })
    .append({
      'label': gettext('status'),
      'name': 'status',
      'singleton': true
    })
    .append({
      'label': gettext('ID'),
      'name': 'id',
      'singleton': true
    });
  }

  function properties() {
    return {
      id: { label: gettext('ID'), filters: ['noValue'] },
      name: { label: gettext('Name'), filters: ['noName'] },
      secret_ref: { label: gettext('Url'), filters: ['noName'] },
      description: { label: gettext('Description'), filters: ['noValue'] },
      content_types: {
        label: gettext('Content Type'),
        filters: [
          'noValue',
          function(item) {
            return item.default;
          }]
      },
      algorithm: { label: gettext('Algorithm'), filters: ['noValue'] },
      bit_length: { label: gettext('Bit Length'), filters: ['noValue'] },
      status: { label: gettext('Status'), filters: ['noValue'] },
      mode: { label: gettext('Mode'), filters: ['noValue'] },
      expiration: { label: gettext('Expiration'), filters: ['simpleDate', 'noValue'] },
      created: { label: gettext('Created'), filters: ['simpleDate', 'noValue'] },
      updated: { label: gettext('Updated'), filters: ['simpleDate', 'noValue'] }
    };
  }

  config.$inject = [
    '$provide',
    '$windowProvider',
    '$routeProvider'
  ];

  /**
   * @name config
   * @param {Object} $provide
   * @param {Object} $windowProvider
   * @param {Object} $routeProvider
   * @description Routes used by this module.
   * @returns {undefined} Returns nothing
   */
  function config($provide, $windowProvider, $routeProvider) {
    var path = $windowProvider.$get().STATIC_URL + 'dashboard/barbican/secrets/';
    $provide.constant('horizon.dashboard.barbican.secrets.basePath', path);
    $routeProvider.when('/project/secrets', {
      templateUrl: path + 'panel.html'
    });
  }
})();
