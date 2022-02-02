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
import time

import openstack_auth

from horizon import exceptions
from horizon.utils.memoized import memoized
from openstack_dashboard.api import base
from barbicanclient import client as barbican_client
from barbicanclient.exceptions import HTTPClientError


LOG = logging.getLogger(__name__)

ATTRIBUTE_NAMES = [
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
    'payload',
    'payload_content_type'
]

def get_auth_params_from_request(request):
    return (
    request.user.username,
    request.user.token.id,
    request.user.tenant_id,
    request.user.token.project.get('domain_id'),
    base.url_for(request, 'key-manager'),
    base.url_for(request, 'identity')
    )

def map_arguments(arguments):
    new_arguments = {}

    argument_mapping = dict(zip(
    list(map(lambda name: name.replace('_', '').lower(), ATTRIBUTE_NAMES)),
    ATTRIBUTE_NAMES
    ))

    for (name, value) in arguments.items():
        unified_name = name.replace('_', '').lower()

        if unified_name in argument_mapping:
            new_name = argument_mapping[unified_name]
            new_arguments[new_name] = value
        else:
            LOG.debug("Key must be in %s" % ",".join(ATTRIBUTE_NAMES))
            raise exceptions.BadRequest(
                "Key must be in %s" % ",".join(ATTRIBUTE_NAMES)
            )

    return new_arguments


@memoized
def apiclient(request, version=None):
    (
        username,
        token_id,
        project_id,
        project_domain_id,
        barbican_url,
        auth_url
    ) = get_auth_params_from_request(request)

    LOG.debug('barbicanclient connection created using the token "%s" and url'
              '"%s"' % (request.user.token.id, barbican_url))

    auth = openstack_auth.utils.get_token_auth_plugin(
        auth_url=auth_url,
        token=token_id,
        project_id=project_id
    )
    session = openstack_auth.utils.get_session()
    session.auth = auth

    return barbican_client.Client(
        session=session,
        endpoint=barbican_url,
        project_id=project_id
    )


def secret_create(request, **kwargs):
    kwargs = map_arguments(kwargs)
    new_secret = apiclient(request).secrets.create(
        **kwargs
    )

    new_secret.store()
    return new_secret


def secret_update(request, secret_ref, **kwargs):
    payload = None
    kwargs = map_arguments(kwargs)

    if 'payload' in kwargs:
        payload = kwargs['payload']
    else:
        raise exceptions.BadRequest(
            'No payload provided in request.'
        )

    return apiclient(request).secrets.update(secret_ref, payload)


def secret_delete(request, secret_ref_id):
    apiclient(request).secrets.delete(secret_ref_id)
    return True


def secret_list(
        request, limit=None, offset=None, sort_key=None,
        sort_dir=None, detail=True
):
    # TODO: read secrets with pagination
    if limit is None:
        limit = 100
        offset = 0

    found_end = False
    secrets = []

    while not found_end:
        secret_list_part = apiclient(request).secrets.list(
            limit=limit,
            offset=offset
        )

        secrets += secret_list_part
        if len(secret_list_part) < limit:
            found_end = True
        else:
            offset += limit

    return secrets


def secret_show(request, secret_ref_id):
    secret = apiclient(request).secrets.get(secret_ref_id)
    return secret


def payload_show(request, secret_ref_id):
    secret = apiclient(request).secrets.get(secret_ref_id)
    return secret.payload
