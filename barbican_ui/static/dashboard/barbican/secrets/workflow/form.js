(function() {
  'use strict';

  /**
   * @ngdoc overview
   * @name horizon.dashboard.barbican
   * @description
   * Dashboard module to host various barbican panels.
   */

  /* eslint-disable no-unused-vars */

  angular
      .module('horizon.dashboard.barbican.secrets')
      .factory('horizon.dashboard.barbican.secrets.workflow.formFactory', formFactory);

  formFactory.$inject = [
    'horizon.dashboard.barbican.offerdValues',
  ];

  function formFactory(offerdValues) {
    var factory = {
        init: init
    };

    function init(model, mode) {

      var fields = [];
      var row = [];

      if(mode == 'create') {
        fields.push({
          key: 'name',
          title: gettext('Name'),
          placeholder: gettext('Name of the secret'),
        });

        fields.push({
          key: 'secretType',
          title: gettext('Secret Type'),
          type: 'select',
          titleMap: [
            {value: 'opaque', name: gettext('opaque')},
            {value: 'passphrase', name: gettext('passphrase')},
            {value: 'certificate', name: gettext('certificate')},
            {value: 'symmetric', name: gettext('symmetric')},
            {value: 'public', name: gettext('public')},
            {value: 'private', name: gettext('private')}
        ]});

        row = [];

        row.push({
          type: 'section',
          htmlClass: 'col-xs-12 col-sm-4',
          items: [{
            key: 'expirationDate',
            type: 'date',
            title: gettext('Expiration Date'),
            validationMessage: {
              checkDate: 'Please enter a date in the future.'
            },
            '$validators': {
              checkDate: function(value) {
                if (!model.expirationTime) {
                  model.expirationTime = new Date('1970-01-01T00:00:00');
                }
                if (!value) {
                  return true;
                }
                var today = new Date();
                today.setHours(0, 0, 0, 0);
                var inputDate = new Date(value);
                inputDate.setHours(0, 0, 0, 0);
                return today.getTime() <= inputDate.getTime();
              }
            }
          }]
        });

        row.push({
          type: 'section',
          htmlClass: 'col-xs-12 col-sm-4',
          items: [{
            key: 'expirationTime',
            title: gettext('Expiration Time'),
            type: 'time',
            required: true,
            validationMessage: {
              checkTime: 'Please enter a date / time in the future.'
            },
            '$validators': {
              checkTime: function(value) {
                var now = new Date();
                var inputTime = new Date(value);
                var inputDate = new Date();

                if(model.expirationDate) {
                  inputDate = new Date(model.expirationDate);
                }

                inputTime.setDate(inputDate.getDate());
                inputTime.setMonth(inputDate.getMonth());
                inputTime.setYear(inputDate.getFullYear());
                return now.getTime() < inputTime.getTime();
              }
            },
            condition: 'model.expirationDate'
          }]
        });

        fields.push({
          type: 'section',
          htmlClass: 'row',
          items: row
        });

        fields.push({
          type: 'help',
          helpvalue: '<hr/>'
        });
     }

     var payloadTitleMap = [];
     if(mode == 'create') {
       payloadTitleMap.push({value: '', name: gettext('empty')});
     }
     payloadTitleMap.push({value: 'text/plain', name: gettext('Plain Text (UTF-8)')});
     payloadTitleMap.push({value: 'application/octet-stream', name: gettext('Octet Stream')});

     row = [];
     row.push({
       type: 'section',
       htmlClass: 'col-xs-12  col-sm-4',
       items: [{
         key: 'payloadContentType',
         title: gettext('Payload Content Type'),
         type: 'select',
         titleMap: payloadTitleMap
       }]
     });

     row.push({
       type: 'section',
       htmlClass: 'col-xs-12 col-sm-8',
       items: [{
         type: 'help',
         helpvalue: '<div><br/><br/>Your can add a value to your secret later.</div>',
         condition: 'model.payloadContentType==""',
       }, {
         key: 'payload',
         title: gettext('Payload'),
         type: 'textarea',
         placeholder: gettext('Payload of the secret'),
         required: true,
         condition: 'model.payloadContentType=="text/plain"',
       }, {
         key: 'payloadFile',
         title: gettext('Secret File'),
         type:'base64file',
         placeholder: gettext('Payload file of the secret'),
         required: true,
         condition: 'model.payloadContentType=="application/octet-stream"',
         validationMessage: {
           checkFile: 'Please check the file'
         },
         '$validators': {
           checkFile: function(value) {
             return true; // TODO
           }
         },
         onChange: function(modelValue,form) {}
       }]
     });

     fields.push({
       type: 'section',
       htmlClass: 'row',
       items: row
     });

     if(mode=='create') {
       fields.push({
         type: 'help',
         helpvalue: '<hr/>',
       });

       row = [];
       row.push({
         type: 'section',
         htmlClass: 'col-xs-12 col-sm-4',
         items: [{
           key: 'algorithm',
           title: gettext('Algorithm'),
           type: 'select',
           titleMap: [{
             value: '',
             name: gettext('none')
           }].concat(
             offerdValues.algorithm.map(function(algorithm) {
               return {
                 value: algorithm,
                 name: gettext(algorithm.toUpperCase())
               };
             })).concat([
               {value: 'custom', name: gettext('custom')}
             ])
         }, {
           key: 'customAlgorithm',
           title: gettext('Custom Algorithm'),
           type: 'text',
           required: true,
           condition: 'model.algorithm=="custom"'
         }]
       });

       row.push({
         type: 'section',
         htmlClass: 'col-xs-12 col-sm-4 ',
         items: [{
           key: 'mode',
           title: gettext('Mode'),
           type: 'select',
           titleMap: [{
             value: '',
             name: gettext('none')
           }].concat(
             offerdValues.mode.map(function(mode){
               return {
                 value: mode,
                 name: gettext(mode.toUpperCase())
               };
             })).concat([
             {value: 'custom', name: gettext('custom')}
           ])
         }, {
           key: 'customMode',
           title: gettext('Custom Mode'),
           type: 'text',
           required: true,
           condition: 'model.mode=="custom"',
         }]
       });

       row.push({
         type: 'section',
         htmlClass: 'col-xs-12 col-sm-4 ',
         items: [{
           key: 'bitLength',
           title: gettext('Bit Length'),
           type: 'select',
           titleMap: [{
             value: '',
             name: gettext('none')
           }].concat(
             offerdValues.bitLength.map(function(bitLength) {
               return {
                 value: bitLength.toString(),
                 name: bitLength +' '+ gettext('bit')
               };
             })).concat([
             {value: 'custom', name: gettext('custom')}
           ])
         }, {
           key: 'customBitLength',
           title: gettext('Custom Bit Length'),
           validationMessage: {
             isBitNumber: 'Please enter a valid bit length.'
           },
           '$validators': {
             isBitNumber: function(value){
               return parseInt(value) > 0;
             }
           },
           type: 'number',
           condition: 'model.bitLength=="custom"',
         }]
       });

       fields.push({
         type: 'section',
         htmlClass: 'row',
         items: row
       });
     }
     return fields;
   }
   return factory;
 }
  /* eslint-disable no-unused-vars */
})();
