(function() {
  angular.module('schemaForm').provider('base64FileUploadConfig', function() {
    this.setDropText = function (text) {
      this.dropText = text;
    };

    this.$get = function () {
      return this;
    };
  }).config([
    'schemaFormProvider',
    'schemaFormDecoratorsProvider',
    'sfBuilderProvider',
    'sfPathProvider',
    '$windowProvider',
    function(
      schemaFormProvider,
      schemaFormDecoratorsProvider,
      sfBuilderProvider,
      sfPathProvider,
      $windowProvider
    ) {
      var base64file = function(name, schema, options) {
        if (schema.type === 'string' && schema.format === 'base64') {
          var f = schemaFormProvider.stdFormObj(name, schema, options);
          f.key  = options.path;
          f.type = 'base64file';
          options.lookup[sfPathProvider.stringify(options.path)] = f;
          return f;
        }
      };

      schemaFormProvider.defaults.string.unshift(base64file);

      var base = $windowProvider.$get().STATIC_URL + 'framework/widgets/form/fields/';
      var ngModelOptions = sfBuilderProvider.builders.ngModelOptions;
      var ngModel = sfBuilderProvider.builders.ngModel;
      var sfField = sfBuilderProvider.builders.sfField;
      var condition = sfBuilderProvider.builders.condition;
      var defaults = [sfField, ngModel, ngModelOptions, condition];

      schemaFormDecoratorsProvider.defineAddOn(
        'bootstrapDecorator',
        'base64file',
        base + 'angular-schema-form-base64-file-upload.html',
        defaults
      );
    }
  ]);

  angular.module('schemaForm').directive('base64FileUpload', [
    'base64FileUploadConfig',
    '$timeout',
    function(base64FileUploadConfig, $timeout) {

    return {
      restrict: 'A',
      require: 'ngModel',
      scope: true,
      link: function(scope, element, attrs, ngModel) {
        scope.ngModel = ngModel;
        scope.dropAreaHover = false;
        scope.file = undefined;
        scope.fileError = false;
        scope.dropText = base64FileUploadConfig.dropText || 'Click here or drop files to upload';

        var schema = scope.$eval(attrs.base64FileUpload).schema;
        var maxSize = parseInt(schema.maxSize, 10);

        scope.maxSize = maxSize;
        var unit = 'B';

        if (maxSize > 1024) {
          maxSize = maxSize / 1024;
          unit = 'kB';
        }

        if (maxSize > 1024) {
          maxSize = maxSize / 1024;
          unit = 'MB';
        }
        scope.humanMaxSize = maxSize.toFixed(1) + ' ' + unit;

        var validateFile = function(file) {
          var valid = true;
          if (file.size > scope.maxSize) {
            valid = false;
            ngModel.$setValidity('base64FileUploadSize', false);
          } else {
            ngModel.$setValidity('base64FileUploadSize', true);
          }

          scope.$apply();
          return valid;
        };

        var getFile = function(file) {
          if (!file) {
            return;
          }
          if (!validateFile(file)) {
            return;
          }
          var reader = new FileReader();

          scope.file = file;
          scope.file.ext = file.name.split('.').slice(-1)[0];
          scope.file.src = URL.createObjectURL(file);
          scope.hasFile = true;

          var fileSize = file.size / 1024;
          var unit = 'kB';
          if (fileSize > 1024) {
            fileSize = fileSize / 1024;
            unit = 'MB';
          }

          scope.file.humanSize = fileSize.toFixed(1) + ' ' + unit;

          reader.onloadstart = function(e) {
            $timeout(function() {
              scope.loadingFile = true;
            }, 0);
          };

          reader.onload = function(e) {
            $timeout(function() {
              scope.loadingFile = false;
            }, 0);

            var binaryData = e.target.result;
            var base64String = window.btoa(binaryData);
            ngModel.$setViewValue(base64String);
          };

          reader.readAsBinaryString(file);
          scope.$apply();
        };

        scope.isImage = function(file) {
          if (!file) {
            return false;
          }
          return file.type.indexOf('image') > -1;
        };

        scope.removeFile = function(e) {
          e.preventDefault();
          e.stopPropagation();
          scope.file = undefined;
          scope.hasFile = false;
          ngModel.$setViewValue(undefined);
        };

        element.find('input').bind('change', function(e) {
          getFile(e.target.files[0]);
        });

        var dropArea = element.find('.base64-file--drop-area')[0];
        var inputField = element.find('.base64-file--input')[0];

        var clickArea = function(e) {
          e.stopPropagation();
          inputField.click();
        };

        var dragOver = function(e) {
          e.preventDefault();
          e.stopPropagation();
          $timeout(function() {
            scope.dropAreaHover = true;
          }, 0);
        };

        var dragLeave = function(e) {
          e.preventDefault();
          e.stopPropagation();
          $timeout(function() {
            scope.dropAreaHover = false;
          }, 0);
        };

        var drop = function(e) {
          dragLeave(e);
          getFile(e.dataTransfer.files[0]);
        };

        dropArea.addEventListener('click', clickArea, false);
        dropArea.addEventListener('touchstart', clickArea, false);
        dropArea.addEventListener('dragenter', dragOver, false);
        dropArea.addEventListener('dragleave', dragLeave, false);
        dropArea.addEventListener('dragover', dragOver, false);
        dropArea.addEventListener('drop', drop, false);

        scope.$on('$destroy', function () {
          dropArea.removeEventListener('click', clickArea, false);
          dropArea.removeEventListener('touchstart', clickArea, false);
          dropArea.removeEventListener('dragenter', dragOver, false);
          dropArea.removeEventListener('dragleave', dragLeave, false);
          dropArea.removeEventListener('dragover', dragOver, false);
          dropArea.removeEventListener('drop', drop, false);
        });
      },
    };
  }
]);
})();
