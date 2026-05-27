# Closed Shape Area Game

This is a static web version of the original Tkinter project. It can be deployed directly on Vercel through GitHub.

## Files

- `index.html`
- `style.css`
- `script.js`
- `vercel.json`

## Deploy to Vercel through GitHub

1. Create a new GitHub repository.
2. Upload these files to the root of the repository.
3. Go to Vercel and choose **Add New Project**.
4. Import your GitHub repository.
5. Keep the default framework setting as **Other** or **Static**.
6. Leave the build command empty.
7. Deploy.

## Game idea

The player draws a closed shape on a 10 by 10 grid. The program estimates the area using:

Area = 1/2 ∮(x dy - y dx)

In the code, this is approximated with the shoelace formula over many small line segments from the drawing.
