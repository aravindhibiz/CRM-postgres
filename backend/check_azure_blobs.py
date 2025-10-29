import sys
import traceback
from pprint import pprint

sys.path.append('.')

try:
    from app.services.file_storage_factory import get_file_storage_service
except Exception as e:
    print('Failed to import storage factory:', e)
    traceback.print_exc()
    sys.exit(2)

try:
    storage = get_file_storage_service()
    svc_type = type(storage).__name__
    print('Storage service type:', svc_type)

    # If Azure service, try to list blobs
    if 'Azure' in svc_type or 'Blob' in svc_type or hasattr(storage, 'blob_service_client'):
        client = getattr(storage, 'blob_service_client', None)
        container = getattr(storage, 'container_name', None)
        print('Detected Azure-like service. container_name =', container)
        if client and container:
            try:
                container_client = client.get_container_client(container)
                blobs = list(container_client.list_blobs())
                print('Found', len(blobs), 'blobs in container', container)
                for b in blobs[:200]:
                    print('-', b.name)
            except Exception as e:
                print('Error listing blobs:', e)
                traceback.print_exc()
        else:
            print(
                'Storage object missing blob_service_client or container_name attributes')
    else:
        # Local storage - try to detect path attrs
        base_path = getattr(storage, 'base_path', None) or getattr(
            storage, 'upload_dir', None)
        print('Local storage detected. base path:', base_path)
        if base_path:
            import os
            total = 0
            for root, dirs, files in os.walk(base_path):
                for f in files:
                    total += 1
            print('Total files under', base_path, '=', total)

except Exception as e:
    print('Unexpected error:', e)
    traceback.print_exc()
    sys.exit(1)

print('\nDone')
