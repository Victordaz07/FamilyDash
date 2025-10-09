/**
 * Tests for video support utilities
 */

import { 
  isSupportedFormat, 
  categorizeVideoError, 
  sanitizeUri, 
  getExtension,
  isProbablyStream 
} from '../videoSupport';

describe('videoSupport utilities', () => {
  describe('isSupportedFormat', () => {
    it('should return true for MP4 files', () => {
      expect(isSupportedFormat('https://example.com/video.mp4')).toBe(true);
      expect(isSupportedFormat('file://local/video.mp4')).toBe(true);
    });

    it('should return true for MOV files', () => {
      expect(isSupportedFormat('https://example.com/video.mov')).toBe(true);
    });

    it('should return false for unsupported formats', () => {
      expect(isSupportedFormat('https://example.com/video.avi')).toBe(false);
      expect(isSupportedFormat('https://example.com/video.mkv')).toBe(false);
    });

    it('should return false for invalid URLs', () => {
      expect(isSupportedFormat('')).toBe(false);
      expect(isSupportedFormat('invalid-url')).toBe(false);
    });
  });

  describe('categorizeVideoError', () => {
    it('should categorize MediaCodec errors as codec', () => {
      const error = { message: 'MediaCodecVideoRenderer error' };
      const result = categorizeVideoError(error);
      expect(result).toBe('codec');
    });

    it('should categorize network errors', () => {
      const error = { message: 'Network request failed' };
      const result = categorizeVideoError(error);
      expect(result).toBe('network');
    });

    it('should categorize timeout errors', () => {
      const error = { message: 'Request timeout' };
      const result = categorizeVideoError(error);
      expect(result).toBe('timeout');
    });

    it('should return unknown for unrecognized errors', () => {
      const error = { message: 'Some random error' };
      const result = categorizeVideoError(error);
      expect(result).toBe('unknown');
    });
  });

  describe('sanitizeUri', () => {
    it('should convert http to https', () => {
      expect(sanitizeUri('http://example.com/video.mp4')).toBe('https://example.com/video.mp4');
    });

    it('should leave https unchanged', () => {
      const uri = 'https://example.com/video.mp4';
      expect(sanitizeUri(uri)).toBe(uri);
    });

    it('should leave file URIs unchanged', () => {
      const uri = 'file://local/video.mp4';
      expect(sanitizeUri(uri)).toBe(uri);
    });
  });

  describe('getExtension', () => {
    it('should extract extension from URL', () => {
      expect(getExtension('https://example.com/video.mp4')).toBe('mp4');
      expect(getExtension('file://local/video.mov')).toBe('mov');
    });

    it('should handle URLs with query parameters', () => {
      expect(getExtension('https://example.com/video.mp4?param=value')).toBe('mp4');
    });

    it('should return empty string for invalid URLs', () => {
      expect(getExtension('')).toBe('');
      expect(getExtension('invalid')).toBe('');
    });
  });

  describe('isProbablyStream', () => {
    it('should detect HLS streams', () => {
      expect(isProbablyStream('https://example.com/playlist.m3u8')).toBe(true);
    });

    it('should detect DASH streams', () => {
      expect(isProbablyStream('https://example.com/playlist.mpd')).toBe(true);
    });

    it('should return false for regular videos', () => {
      expect(isProbablyStream('https://example.com/video.mp4')).toBe(false);
    });
  });
});
