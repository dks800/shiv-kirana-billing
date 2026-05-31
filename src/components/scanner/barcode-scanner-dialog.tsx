"use client";

import { useEffect, useState } from "react";

import { X } from "lucide-react";

import { useZxing } from "react-zxing";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const barcodeHints = new Map([
  [DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.CODE_128, BarcodeFormat.CODE_39]],
]);

interface BarcodeScannerDialogProps {
  open: boolean;

  onOpenChange: (open: boolean) => void;

  onDetected: (barcode: string) => void;
}

export function BarcodeScannerDialog({
  open,
  onOpenChange,
  onDetected,
}: BarcodeScannerDialogProps) {
  const [hasCamera, setHasCamera] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [scannerActive, setScannerActive] = useState(false);

  /*
   ---------------------------------------------------
   Barcode Scanner
   ---------------------------------------------------
  */

  //   const [isProcessing, setIsProcessing] = useState(false);

  //   const { ref } = useZxing({
  //     paused: !open || isProcessing,
  //     constraints: {
  //       video: {
  //         facingMode: "environment",
  //       },
  //       audio: false,
  //     },
  //     onDecodeResult(result) {
  //       if (isProcessing) return;
  //       const barcode = result.getText();
  //       if (!barcode) return;
  //       setIsProcessing(true);
  //       onDetected(barcode);
  //       onOpenChange(false);
  //       setTimeout(() => {
  //         setIsProcessing(false);
  //       }, 1500);
  //     },

  //     onError(error) {
  //       console.error("Scanner error:", error);
  //       toast.error("Scanner error: " + error);
  //       setHasCamera(false);
  //     },
  //   });

  const [isProcessing, setIsProcessing] = useState(false);

  const { ref } = useZxing({
    // paused: !open || isProcessing,
    paused: !open || !scannerActive || isProcessing,
    constraints: {
      video: {
        facingMode: {
          ideal: "environment",
        },

        width: {
          ideal: 1920,
        },

        height: {
          ideal: 1080,
        },

        focusMode: "continuous",
      } as MediaTrackConstraints & { focusMode: string },

      audio: false,
    },

    hints: barcodeHints,

    onDecodeResult(result) {
      if (isProcessing) return;

      const barcode = result.getText();

      console.log("Detected barcode:", barcode);

      if (!barcode) return;

      setIsProcessing(true);

      onDetected(barcode);

      onOpenChange(false);

      setTimeout(() => {
        setIsProcessing(false);
      }, 1500);
    },

    onError(error) {
      console.error("Scanner error:", error);
      toast.error("Scanner error: " + error);
      setHasCamera(false);
    },
  });

  /*
   ---------------------------------------------------
   Check Camera Access
   ---------------------------------------------------
  */

  useEffect(() => {
    async function checkCamera() {
      try {
        await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        setHasCamera(true);
      } catch (error) {
        console.error(error);

        setHasCamera(false);
      }
    }

    if (open) {
      checkCamera();
    }
  }, [open]);

  /*
   ---------------------------------------------------
   Cleanup
   ---------------------------------------------------
  */

  useEffect(() => {
    return () => {
      const video = document.querySelector("video");

      if (video?.srcObject) {
        const tracks = (video.srcObject as MediaStream).getTracks();

        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const timer = setTimeout(() => {
      setScannerActive(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, [isReady]);

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      setIsReady(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);

        if (!value) {
          setIsReady(false);
        }
      }}
    >
      <DialogContent
        className="
          overflow-hidden
          rounded-2xl
          p-0
          sm:max-w-md
        "
      >
        <div className="relative bg-black">
          {/* Close Button */}

          <Button
            size="icon"
            type="button"
            variant="ghost"
            className="
              absolute
              right-2
              top-2
              z-10
              cursor-pointer
              rounded-full
              bg-black/50
              text-white
              hover:bg-black/70
            "
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Camera Feed */}

          {hasCamera && isReady ? (
            <div className="relative bg-black">
              {isReady && (
                <>
                  <video
                    ref={ref}
                    autoPlay
                    playsInline
                    muted
                    className="
          aspect-square
          w-full
          object-cover
          bg-black
        "
                  />

                  {/* Scanner Overlay */}

                  <div
                    className="
          pointer-events-none
          absolute
          inset-0
          flex
          items-center
          justify-center
        "
                  >
                    <div
                      className="
            h-28
            w-72
            rounded-xl
            border-4
            border-green-400
            shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]
          "
                    />
                  </div>
                </>
              )}
            </div>
          ) : (
            <div
              className="
                flex
                aspect-square
                items-center
                justify-center
                p-6
                text-center
                text-sm
                text-white
              "
            >
              Unable to access camera.
              <br />
              Please allow camera permission.
            </div>
          )}
        </div>

        {/* Footer */}

        <div className="space-y-1 p-4 text-center">
          <p className="font-medium">Scan Product Barcode</p>

          <p
            className="
              text-sm
              text-muted-foreground
            "
          >
            Align barcode within camera frame
          </p>
          <p className="text-xs text-muted-foreground">
            Waiting for barcode...
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
