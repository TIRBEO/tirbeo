"use client";

import { TriangleExclamation } from "@gravity-ui/icons";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal";

export function CustomBackdrop() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button color="danger" onPress={onOpen}>
        Delete Account
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
        classNames={{
          backdrop:
            "bg-linear-to-t from-red-950/90 via-red-950/50 to-transparent dark:from-red-950/95 dark:via-red-950/60",
        }}
        placement="center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col items-center gap-1 text-center">
                <div className="flex size-10 items-center justify-center rounded-full bg-danger/10">
                  <TriangleExclamation className="size-5 text-danger" />
                </div>
                <span className="text-lg font-semibold">Permanently delete your account?</span>
              </ModalHeader>
              <ModalBody>
                <p className="text-center text-sm text-default-500">
                  This action cannot be undone. All your data, settings, and content will be
                  permanently removed from our servers. The dramatic red backdrop emphasizes the
                  severity and irreversibility of this decision.
                </p>
              </ModalBody>
              <ModalFooter className="flex-col">
                <Button className="w-full" color="danger" onPress={onClose}>
                  Delete Forever
                </Button>
                <Button className="w-full" variant="flat" onPress={onClose}>
                  Keep Account
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
