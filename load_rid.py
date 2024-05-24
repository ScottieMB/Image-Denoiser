import tensorflow as tf
import cv2
import numpy as np


def get_patches(image):
    image=cv2.cvtColor(image,cv2.COLOR_BGR2RGB)
    height, width , channels= image.shape
    crop_sizes=[1]
    patch_size=40
    patches = []
    for crop_size in crop_sizes: #We will crop the image to different sizes
        crop_h, crop_w = int(height*crop_size),int(width*crop_size)
        image_scaled = cv2.resize(image, (crop_w,crop_h), interpolation=cv2.INTER_CUBIC)
        for i in range(0, crop_h-patch_size+1, int(patch_size/1)):
            for j in range(0, crop_w-patch_size+1, int(patch_size/1)):
              x = image_scaled[i:i+patch_size, j:j+patch_size] # This gets the patch from the original image with size patch_size x patch_size
              patches.append(x)
    return patches

def get_image(gt):
  patches=get_patches(gt)
  height, width , channels= gt.shape
  patches=np.array(patches)

  #predicting the output on the patches of test image
  patches = patches.astype('float32') /255.
  patches_noisy = patches+ tf.random.normal(shape=patches.shape,mean=0,stddev=0)
  patches = tf.clip_by_value(patches_noisy, clip_value_min=0.0, clip_value_max=1.0)

  return patches

def create_image_from_patches(patches,image_shape):
  image=np.zeros(image_shape) # Create a image with all zeros with desired image shape
  patch_size=patches.shape[1]
  p=0
  for i in range(0,image.shape[0]-patch_size+1,int(patch_size/1)):
    for j in range(0,image.shape[1]-patch_size+1,int(patch_size/1)):
      image[i:i+patch_size,j:j+patch_size]=patches[p] # Assigning values of pixels from patches to image
      p+=1
  return np.array(image)

def predict_fun(model,patches_noisy,gt):

  height, width , channels= gt.shape
  gt=cv2.resize(gt, (width//40*40,height//40*40), interpolation=cv2.INTER_CUBIC)
  denoised_patches=model.predict(patches_noisy)
  denoised_patches=tf.clip_by_value(denoised_patches, clip_value_min=0., clip_value_max=1.)

  #Creating entire denoised image from denoised patches
  denoised_image=create_image_from_patches(denoised_patches,gt.shape)

  return denoised_image

def final_rid(image, model):

    model=tf.keras.models.load_model(model)

    patches_noisy = get_image(image)

    denoised_image = predict_fun(model,patches_noisy,image)

    denoised_download = cv2.cvtColor((denoised_image*255).astype(np.uint8), cv2.COLOR_BGR2RGB)

    return denoised_download

