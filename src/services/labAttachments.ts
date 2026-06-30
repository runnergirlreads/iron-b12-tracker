import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Directory, File, Paths } from 'expo-file-system';
import { LabResult } from '../types';

const ATTACHMENTS_DIR = 'lab-attachments';

function attachmentsDirectory(): Directory {
  const dir = new Directory(Paths.document, ATTACHMENTS_DIR);
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
  return dir;
}

function extensionForMime(mimeType?: string, name?: string): string {
  if (mimeType?.includes('pdf') || name?.toLowerCase().endsWith('.pdf')) return 'pdf';
  if (mimeType?.includes('png') || name?.toLowerCase().endsWith('.png')) return 'png';
  if (mimeType?.includes('heic')) return 'heic';
  return 'jpg';
}

function kindForMime(mimeType?: string, name?: string): 'image' | 'pdf' {
  if (mimeType?.includes('pdf') || name?.toLowerCase().endsWith('.pdf')) return 'pdf';
  return 'image';
}

export async function persistLabAttachment(
  labId: string,
  sourceUri: string,
  mimeType?: string,
  originalName?: string,
): Promise<Pick<LabResult, 'attachmentUri' | 'attachmentName' | 'attachmentKind'>> {
  const ext = extensionForMime(mimeType, originalName);
  const dest = new File(attachmentsDirectory(), `${labId}.${ext}`);
  const source = new File(sourceUri);

  if (dest.exists) {
    dest.delete();
  }

  source.copy(dest);

  return {
    attachmentUri: dest.uri,
    attachmentName: originalName ?? `lab-${labId}.${ext}`,
    attachmentKind: kindForMime(mimeType, originalName),
  };
}

export function deleteLabAttachment(uri?: string): void {
  if (!uri) return;
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // ignore missing files
  }
}

export async function pickLabImage(): Promise<{
  uri: string;
  mimeType?: string;
  name?: string;
} | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Photo library permission is required');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.85,
  });

  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    mimeType: asset.mimeType ?? 'image/jpeg',
    name: asset.fileName ?? 'lab-photo.jpg',
  };
}

export async function pickLabPdf(): Promise<{
  uri: string;
  mimeType?: string;
  name?: string;
} | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    mimeType: asset.mimeType ?? 'application/pdf',
    name: asset.name,
  };
}
