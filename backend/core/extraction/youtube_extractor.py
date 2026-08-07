from __future__ import annotations
import os
import re
import tempfile

from core.extraction.pdf_extractor import ExtractionResult
from core.transcription import transcribe_audio

YOUTUBE_ID_RE = re.compile(
    r"(?:youtu\.be/|youtube\.com/(?:watch\?v=|embed/|shorts/|live/))([A-Za-z0-9_-]{11})"
)


def extract_video_id(url: str) -> str | None:
    match = YOUTUBE_ID_RE.search(url)
    return match.group(1) if match else None


async def _fetch_captions(video_id: str, language: str = "en") -> str | None:
    """Try to use YouTube's own captions/auto-captions first — much faster and
    cheaper than downloading + transcribing audio, and works without ffmpeg."""
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
    except ImportError:
        return None
    try:
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        try:
            transcript = transcript_list.find_transcript([language, "en"])
        except Exception:
            transcript = next(iter(transcript_list))
        entries = transcript.fetch()
        text = " ".join(entry.get("text", "") for entry in entries if entry.get("text"))
        return text.strip() or None
    except Exception:
        return None


async def _download_and_transcribe(url: str, language: str = "en") -> tuple[str, dict]:
    """Fallback for videos with no captions: download audio-only with yt-dlp and
    transcribe it with the same Whisper pipeline used for uploaded audio files.
    Requires ffmpeg to be installed on the server."""
    try:
        import yt_dlp
    except ImportError:
        return "", {"error": "yt-dlp not installed on the server"}

    tmp_dir = tempfile.mkdtemp(prefix="thinkhive-yt-")
    out_template = os.path.join(tmp_dir, "audio.%(ext)s")
    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": out_template,
        "quiet": True,
        "no_warnings": True,
        "noplaylist": True,
        "postprocessors": [{
            "key": "FFmpegExtractAudio",
            "preferredcodec": "mp3",
            "preferredquality": "128",
        }],
    }
    title = url
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            title = info.get("title") or url

        produced = [f for f in os.listdir(tmp_dir) if f.startswith("audio.")]
        if not produced:
            return "", {"error": "Could not extract audio from this video", "title": title}

        audio_path = os.path.join(tmp_dir, produced[0])
        with open(audio_path, "rb") as f:
            content = f.read()

        text, error = await transcribe_audio(content, produced[0], language)
        if error:
            return "", {"error": error, "title": title}
        return text, {"title": title}
    except Exception as e:
        return "", {"error": str(e), "title": title}
    finally:
        for f in os.listdir(tmp_dir):
            os.unlink(os.path.join(tmp_dir, f))
        os.rmdir(tmp_dir)


async def extract_youtube(url: str, language: str = "en") -> ExtractionResult:
    """Extract a transcript for a YouTube video: prefer existing captions,
    fall back to downloading the audio and transcribing it with Whisper."""
    video_id = extract_video_id(url)
    if not video_id:
        return ExtractionResult(text="", metadata={
            "source_type": "youtube", "url": url,
            "error": "Could not parse a YouTube video ID from that URL",
        })

    captions = await _fetch_captions(video_id, language)
    if captions:
        return ExtractionResult(text=captions, metadata={
            "source_type": "youtube", "video_id": video_id, "url": url,
            "transcript_source": "captions",
        })

    text, meta = await _download_and_transcribe(url, language)
    if not text:
        return ExtractionResult(text="", metadata={
            "source_type": "youtube", "video_id": video_id, "url": url,
            "title": meta.get("title"),
            "error": meta.get("error", "Could not transcribe this video"),
        })
    return ExtractionResult(text=text, metadata={
        "source_type": "youtube", "video_id": video_id, "url": url,
        "title": meta.get("title"), "transcript_source": "whisper",
    })