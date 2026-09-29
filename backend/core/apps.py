import logging

from django.apps import AppConfig

from core.log_filters import IgnoreProbe404


class CoreConfig(AppConfig):
    name = 'core'

    def ready(self):
        probe_filter = IgnoreProbe404()
        logging.getLogger('django.request').addFilter(probe_filter)
        logging.getLogger('django.server').addFilter(probe_filter)
