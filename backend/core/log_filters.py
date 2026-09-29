import logging


class IgnoreProbe404(logging.Filter):
    """Drop 404 warnings from internet scanners. Keep real /api/ misses."""

    _MARKERS = (
        '.env',
        '.git',
        '.php',
        '.aws',
        'wp-',
        'wordpress',
        'wlwmanifest',
        'xmlrpc',
        'phpinfo',
        'config.js',
        'robots.txt',
        'favicon.ico',
    )

    def filter(self, record):
        status = getattr(record, 'status_code', None)
        request = getattr(record, 'request', None)
        path = getattr(request, 'path', '') or ''
        if not isinstance(path, str):
            path = ''
        if not path and record.args:
            try:
                if status is None:
                    status = int(str(record.args[1]).split()[0])
                path = str(record.args[0]).split(' ', 2)[1].split('?', 1)[0]
            except (IndexError, ValueError, TypeError):
                return True
        if status != 404:
            return True
        lowered = path.lower()
        if any(marker in lowered for marker in self._MARKERS):
            return False
        return lowered.startswith('/api/')
