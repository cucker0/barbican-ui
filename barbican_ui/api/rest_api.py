#    Licensed under the Apache License, Version 2.0 (the "License"); you may
#    not use this file except in compliance with the License. You may obtain
#    a copy of the License at
#
#         http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
#    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
#    License for the specific language governing permissions and limitations
#    under the License.

import logging
import re

from django.views import generic
from barbican_ui.api import client

from openstack_dashboard.api import base
from openstack_dashboard.api.rest import urls
from openstack_dashboard.api.rest import utils as rest_utils

import barbicanclient


LOG = logging.getLogger(__name__)

def change_to_dict(secret):
    """Change key named 'uuid' to 'id'

    API returns objects with a field called 'uuid' many of Horizons
    directives however expect objects to have a field called 'id'.
    """

    new_dict = dict()

    for attr in [
            'secret_ref',
            'name',
            'expiration',
            'algorithm',
            'bit_length',
            'secret_type',
            'mode',
            'payload_content_encoding',
            'created',
            'updated',
            'content_types',
            'status',
            'payload_content_type'
    ]:
        new_dict[attr] = getattr(secret, attr)

    matches = re.findall(r'secrets\/([A-z0-9-]*)', secret.secret_ref)
    if len(matches) != 1:
        raise Exception(
            "Regex to determine secret-id failed. Matches are [%s]" % ",".join(matches)
        )

    new_dict['id'] = matches[0]
    return new_dict

def get_full_secret_ref(request, secret_ref_id):
    """Get the full secret reference for a secret reference id"""

    endpoint = base.url_for(request, 'key-manager')
    secret_ref = endpoint + '/v1/secrets/' + secret_ref_id
    return secret_ref


@urls.register
class Secret(generic.View):
    """API for retrieving a single Secret"""
    url_regex = r'barbican/secrets/(?P<secret_ref_id>[^/]+)$'

    @rest_utils.ajax()
    def get(self, request, secret_ref_id):
        """Get a specific secret"""

        secret_ref = get_full_secret_ref(request, secret_ref_id)
        return rest_utils.JSONResponse(
            change_to_dict(client.secret_show(request, secret_ref))
        )

    @rest_utils.ajax(data_required=True)
    def post(self, request, secret_ref_id):
        """
        Update a Secret.
        Returns the updated Secret object on success.
        """

        secret_ref = get_full_secret_ref(request, secret_ref_id)

        try:
            client.secret_update(request, secret_ref, **request.DATA)
            return rest_utils.CreatedResponse(
                '/api/barbican/secret/%s' % secret_ref, {
                    'uuid': secret_ref
                })
        except barbicanclient.exceptions.HTTPClientError as error:
            if error.status_code == 409:
                return rest_utils.JSONResponse({
                    'msg': 'secret already contains data',
                    'status_code': 409
                }, 409)

        return rest_utils.JSONResponse({
            'msg': 'unknwon error'
        }, 500)


@urls.register
class Payload(generic.View):
    """API for retrieving a single Payload"""
    url_regex = r'barbican/payload/(?P<secret_ref_id>[^/]+)$'

    @rest_utils.ajax()
    def get(self, request, secret_ref_id):
        """Get a specific payload"""

        secret_ref = get_full_secret_ref(request, secret_ref_id)
        return rest_utils.JSONResponse({
            'secret_ref': secret_ref,
            'payload': client.payload_show(request, secret_ref)
        })


@urls.register
class Secrets(generic.View):
    """API for Secrets"""
    url_regex = r'barbican/secrets/$'

    @rest_utils.ajax()
    def get(self, request):
        """
        Get a list of the Secrets for a project.
        The returned result is an object with property 'items' and each
        item under this is a Secret.
        """
        result = client.secret_list(request, detail=False)
        return rest_utils.JSONResponse({
            'items': [change_to_dict(n) for n in result]
        })

    @rest_utils.ajax(data_required=True)
    def delete(self, request):
        """
        Delete one or more Secrets by id.
        Returns HTTP 204 (no content) on successful deletion.
        """

        for secret_ref_id in request.DATA:
            secret_ref = get_full_secret_ref(request, secret_ref_id)
            client.secret_delete(request, secret_ref)

        return rest_utils.JSONResponse({}, 204)

    @rest_utils.ajax(data_required=True)
    def put(self, request):
        """
        Create a new Secret.
        Returns the new Secret object on success.
        """

        secret = client.secret_create(request, **request.DATA)
        secret_dict = change_to_dict(secret)

        response = rest_utils.CreatedResponse(
            '/api/barbican/secret/%s' % secret_dict['id'],
            secret_dict
        )

        return response
