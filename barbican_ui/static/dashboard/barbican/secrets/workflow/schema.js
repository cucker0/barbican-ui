(function() {
  'use strict';

  /**
   * @ngdoc overview
   * @name horizon.dashboard.barbican
   * @description
   * Dashboard module to host various barbican panels.
   */
  // fixme: if ngRoute and $routeProvider are unnecessary, remove them
  /* eslint-disable no-unused-vars */

  angular
      .module('horizon.dashboard.barbican.secrets')
      .factory('horizon.dashboard.barbican.secrets.workflow.schemaFactory', schemaFactory);

  schemaFactory.$inject = [
    'horizon.dashboard.barbican.offerdValues',
  ];

  function schemaFactory($provide) {
    var factory = {
        init: init
    };

    function init(mode) {
      var schema = {
        type: 'object',
        properties: {
          name: {
            type: 'string'
          },
          secretType: {
            type: 'string',
            default: 'opaque'
          },
          expirationDate: {
            type: 'Date'
          },
          expirationTime: {
            type: 'Date',
            default: new Date('1970-01-01T00:00:00')
          },
          payloadContentType: {
            type: 'string',
            default: ''
          },
          payload: {
            type: 'string'
          },
          payloadFile: {
            type: 'string',
            format: 'base64',
            maxSize: 1024
          },
          algorithm: {
            type: 'string',
            default: ''
          },
          customAlgorithm: {
            type: 'string',
            default: '',
            required: true
          },
          mode: {
            type: 'string',
            default: ''
          },
          customMode: {
            type: 'string',
            required: true
          },
          bitLength: {
            type: 'string',
            default: ''
          },
          customBitLength: {
            type: 'number',
            default: 2048,
            required: true
          }
        }
      };

      if(mode == 'update') {
        schema.properties.payloadContentType.default = 'text/plain';
      }

      return schema;
    }
    return factory;
  }
  /* eslint-disable no-unused-vars */
})();
