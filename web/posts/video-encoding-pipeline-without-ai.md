# Building a Video Encoding Pipeline Without AI

I started this project because I wanted a way to take relatively low-quality videos and optimize them without running AI models.

There are probably open-source and open-weight models that could improve video quality, but the videos I am working with are relatively long. Processing that much footage with a model would require a lot of GPU time and compute, which would quickly add unnecessary cost. I wanted to see how far I could get with conventional video encoding instead.

This project is not just a small side project to me. I am deeply interested in video encoding and in understanding what actually happens beneath the tools most people use without thinking about them.

## The preservation problem

The original motivation was preservation.

Videos uploaded to Facebook and other social platforms do not always remain easy to access forever. Older messages and videos can disappear from the visible history over time, so there is no reliable backlog to fall back on when someone visits the page later.

I wanted a way to preserve those videos while also reducing their storage and delivery cost. That meant building more than a local FFmpeg command. I wanted to understand the system around the encoder: how videos are received, where they are stored, how the work is scheduled, and how the final result gets delivered.

## Why FFmpeg interested me

FFmpeg is one of the most important pieces of software in the video ecosystem. Almost every video-encoding tool or player depends on it directly or indirectly.

I once looked through its source code and was blown away by the scale of it. I did not particularly like the C codebase then, and I still do not enjoy working with C as much as modern languages, but the scope of the project is incredible. It is not just a command-line utility. It is a huge collection of codecs, formats, filters, demuxers, muxers, and low-level media handling logic that supports a significant part of the software world.

That made the project more interesting to me. I did not want to run a local FFmpeg demo and stop there. I wanted to build the container orchestration and cloud services needed to run it as a real pipeline and see whether the surrounding system was as complicated as I expected.

It turned out to be less complex than I originally feared. I did not need as many heavy cloud services as I first thought, which made the project feel more practical and more approachable.

## The original architecture

The first version of the pipeline was designed around durable raw storage:

1. **Ingestion:** Download a video from Facebook or receive the raw recording directly. Only an administrator would be able to upload videos and trigger the pipeline.
2. **Raw storage:** Upload the unedited video to a Cloudflare R2 bucket, partly because of its generous free tier.
3. **Encoding:** Have the encoding service download the raw video from R2 and perform the optimization and compression.
4. **Optimized storage:** Upload the encoded video back to R2.
5. **Cleanup:** After confirming that the optimized result was good, automatically delete the raw video after a short retention period, perhaps a day. Manual deletion could also be supported.

While designing this version, I was learning more about video encoding and FFmpeg, especially how frames work. I-frames contain a complete image and generally require more space. P-frames reference previous frames, while B-frames can reference both previous and future frames, allowing better compression in many cases.

I was willing to use slower encoding settings if they produced better compression while preserving quality. Speed was not the main priority.

## The simpler architecture

When I came back to the project recently, I looked at this design again and noticed an unnecessary step for my personal use case.

If the encoding service is already going to download and temporarily store the entire video before processing it, there is no real need to upload the raw video to R2 first. I could upload the video directly to the machine or container that performs the encoding.

The updated flow is simpler:

1. Upload the raw video directly to the video optimization service.
2. Run the encoding and compression there.
3. Upload only the final optimized video to Cloudflare R2.

This removes an unnecessary upload and download cycle. There is also no separate raw-video cleanup step because the temporary copy disappears with the compute environment after processing.

For my personal pipeline, that simplicity matters more than preserving a second copy of every source video in object storage.

## Personal use versus production

The interesting part is that the original architecture is still the better choice for a production system.

Compute instances and containers are not necessarily permanent. They can restart, shut down, or be replaced. If the only copy of the source video exists on that machine when something goes wrong, the source may be lost.

With the original architecture, the raw video is already safely stored in R2 before encoding begins. If the encoding service crashes, the instance disappears, or processing fails halfway through, another worker can download the original video and retry the job.

That gives the production design much better durability and recoverability:

**Personal use:**

Raw video -> Encoding service -> Optimized video -> R2

**Production system:**

Raw video -> Durable object storage -> Encoding worker -> Optimized video -> Object storage

The production version introduces another storage operation, but it also gives the pipeline a durable source of truth. For a personal project, I prefer the simpler flow. For an enterprise or production system, I would probably use the durable-storage architecture.

## The encoding direction

The actual encoding process is its own technical problem. It involves probing the source video, deciding what resolution and encoding settings make sense, running FFmpeg, compressing the output, validating the result, and uploading it.

I am experimenting with using three consecutive B-frames to optimize for faster compression while aiming for near-lossless quality. The videos I am working with are long-form rather than high-motion, fast-paced content, so the movements are relatively small and subtle.

High-motion videos require a lot of keyframes, or I-frames, and predictive frames, or P-frames, with fewer bidirectional frames, or B-frames. That inevitably takes much longer to compress. For my use case, utilizing triple B-frames seems like a good fit.

The structure I am testing places three B-frames between keyframes, following an `IPBBBP` pattern.

The encoding details deserve a dedicated technical write-up. This post is primarily about why I decided to build the project and how the surrounding pipeline evolved.

## Why I am hand-coding it

I am also hand-coding this project instead of letting an AI coding agent implement most of it.

For some of my other projects, I design the architecture while AI handles a large part of the implementation. That approach can be useful, especially when the goal is to move quickly or validate an idea.

This project has a different purpose. I want to understand the internals myself: FFmpeg, encoding decisions, video frames, compression, temporary storage, container orchestration, and the cloud services around the pipeline. If an agent implemented the difficult parts for me, I might end up with a working system without gaining the understanding I actually wanted.

I am not actively developing the project right now because I have been working on several other projects. I still plan to continue it, because the problem sits at the intersection of several areas I care about: low-level media processing, distributed systems, cloud infrastructure, and practical cost optimization.

The goal was never just to make a video smaller. It was to understand how a piece of software as important as FFmpeg can be turned into a reliable service, and how much infrastructure is actually needed to do that well.
