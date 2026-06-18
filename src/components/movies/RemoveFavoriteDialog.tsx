'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type RemoveFavoriteDialogProps = {
  movieTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

const RemoveFavoriteDialog = ({
  movieTitle,
  open,
  onOpenChange,
  onConfirm,
}: RemoveFavoriteDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent onOverlayClick={() => onOpenChange(false)}>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove from favorites?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove <strong>{movieTitle}</strong> from your favorites?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Remove</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RemoveFavoriteDialog;
