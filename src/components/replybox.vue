<template>
  <div ref="replybox" id="replybox">
    <div id="replybox-head">
      <span class="noselect"
      ref="dragSpan"
      @mousedown="dragMouseDown"
      >
        responder ao post #111
      </span>
      <button class="close" type="button">
        x
      </button>
    </div>
    <form id="replyForm" action="">
      <div class="form-group">
        <label for="username">Usuário</label>
        <input type="text" class="form-control" id="username"
        aria-describedby="usernameHelp"
        placeholder="Anonymous"
        required>
      </div>
      <div class="form-group">
        <label for="message">Mensagem</label>
        <textarea class="form-control" id="message" rows="5" required>
        </textarea>
      </div>
      <button type="submit" class="btn btn-primary">Enviar</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'ReplyBox',
  data: () => ({
    positions: {
      clientX: undefined,
      clientY: undefined,
      movementX: 0,
      movementY: 0,
      boundsFlag: '',
      dragging: false,
    },
  }),
  methods: {
    dragMouseDown(event) {
      // event.target.classList.add('grabbing');
      event.preventDefault();
      // console.log('event.clientX', event.clientX);
      // console.log('event.screenX', event.screenX);
      // console.log('dif between the two', event.screenX - event.clientX);
      // get the mouse cursor position at startup:
      const spanRect = event.target.getBoundingClientRect();
      this.positions.dragging = true;
      this.positions.clickedLeft = event.pageX - spanRect.left;
      this.positions.clickedTop = event.clientY - spanRect.top;
      // console.log(event.pageY);
      // console.log(this.positions.clickedTop);
      this.positions.clientX = event.clientX;
      this.positions.clientY = event.clientY;
      document.onmousemove = this.elementDrag;
      document.onmouseup = this.closeDragElement;
    },
    elementDrag(event) {
      event.preventDefault();
      if (this.positions.dragging) {
        const replyBoxPos = this.$refs.replybox.getBoundingClientRect();
        if (!(replyBoxPos.top > 0)) this.positions.boundsFlag = 'top';
        // if (!(event.clientY > 0)) this.positions.boundsFlag = 'top';
        // devo ver a posição que a replyBox está e não o mouse
        // console.log('replyBox top:', this.$refs.replybox.style.top);
        // console.log('clientY:', event.clientY);
        if (!(replyBoxPos.top < window.innerHeight - replyBoxPos.height)) {
          this.positions.boundsFlag = 'bottom';
        }
        // if (!(event.clientY < window.innerHeight - replyBoxPos.height))
        //  this.positions.boundsFlag = 'bottom';
        if (!(replyBoxPos.left > 0)) this.positions.boundsFlag = 'left';
        if (!(replyBoxPos.left < window.innerWidth - replyBoxPos.width)) this.positions.boundsFlag = 'right';
        if (this.positions.boundsFlag === '') {
          this.$refs.replybox.style.left = `${event.clientX - this.positions.clickedLeft}px`;
          this.$refs.replybox.style.top = `${event.clientY - this.positions.clickedTop - 17}px`;
          // VERIFICAR APÓS SETAR OS VALORES DEIXA MAIS FLUIDO !!
          if (this.$refs.replybox.getBoundingClientRect().left < 0) {
            this.$refs.replybox.style.left = '1px';
          } else if (this.$refs.replybox.getBoundingClientRect().left > window.innerWidth) {
            this.$refs.replybox.style.left = `${window.innerWidth - 1}px`;
          }
        } else {
          // TEM QUE TRAVAR AS DIMENSÕES ISOLADAMENTE !! TRAVOU DIREITA MAS AINDA PODE MOVER CIMA/BAIXO !!
          switch (this.positions.boundsFlag) {
            case 'top':
              if ((event.clientY > 25)) {
                this.positions.boundsFlag = '';
              } else {
                this.$refs.replybox.style.top = '1px';
              }
              break;
            case 'bottom':
              if ((event.clientY < window.innerHeight - replyBoxPos.height)) {
                this.positions.boundsFlag = '';
              } else {
                this.$refs.replybox.style.top = `${window.innerHeight - replyBoxPos.height - 1}px`;
              }
              break;
            case 'left':
              if ((event.clientX > replyBoxPos.width / 3)) {
                if (!(this.positions.clickedLeft > ((replyBoxPos.width / 3) - 50))) {
                  this.positions.clickedLeft = (replyBoxPos.width / 3) - 50;
                }
                this.positions.boundsFlag = '';
              } else {
                this.$refs.replybox.style.left = '1px';
              }
              break;
            case 'right':
              if (event.clientX < window.innerWidth - replyBoxPos.width / 2) {
                this.positions.clickedLeft = (0.5 * replyBoxPos.width) + 50;
                this.positions.boundsFlag = '';
              } else {
                this.$refs.replybox.style.left = `${window.innerWidth - replyBoxPos.width - 1}px`;
              }
              break;
            default:
              this.positions.boundsFlag = '';
          }
        }
      }
      //   else if (this.positions.boundsFlag === 'top') {
      //     if ((event.clientY > 25)) {
      //       this.positions.boundsFlag = '';
      //     }
      //   } else if ()
      // }
      // this.positions.movementX = this.positions.clientX - event.clientX;
      // this.positions.movementY = this.positions.clientY - event.clientY;
      // const replyBoxPos = this.$refs.replybox.getBoundingClientRect();
      // // check that mouse is in screen
      // if (!(event.clientY > 0)) this.positions.boundsFlag = 'top';
      // if (!(event.clientY < window.innerHeight)) this.positions.boundsFlag = 'bottom';
      // if (!(event.clientX > 0)) this.positions.boundsFlag = 'left';
      // if (!(event.clientX < window.innerWidth)) this.positions.boundsFlag = 'right';
      // // if (event.clientX > 0 && event.clientX < window.innerWidth
      // // && event.clientY > 0 && event.clientY < window.innerHeight) {
      // if (this.positions.boundsFlag === undefined) {
      //   // check that mouse is inside draggable element
      //   //  {
      //   this.positions.clientX = event.clientX;
      //   this.positions.clientY = event.clientY;
      //   // set the element's new position:
      //   const newPosY = (this.$refs.replybox.offsetTop - this.positions.movementY);
      //   const bodyPosTop = newPosY + this.$refs.replybox.style.width;
      //   const bodyPosBottom = newPosY + replyBoxPos.height;
      //   if (bodyPosTop > 0
      //   && bodyPosBottom <= (window.innerHeight || document.documentElement.clientHeight)) {
      // this.$refs.replybox.style.top
      // = `${(this.$refs.replybox.offsetTop - this.positions.movementY)}px`;
      //   }
      //   this.$refs.replybox.style.left = `${(this.$refs.replybox.offsetLeft
      // - this.positions.movementX)}px`;
      //   // }
      // } else if (this.positions.boundsFlag === 'top') {
      //   if ((event.clientY > 25) && this.isInSpan(event)) {
      //     this.positions.boundsFlag = undefined;
      //   }
      // }
      // console.log(this.positions.boundsFlag);
      // console.log(event.clientY);
    },
    closeDragElement() {
      this.positions.dragging = false;
      document.onmouseup = null;
      document.onmousemove = null;
    },
    isInSpan(event) {
      const dragSpanPos = this.$refs.dragSpan.getBoundingClientRect();
      if (event.clientX > dragSpanPos.left
        && event.clientX < dragSpanPos.right
        && event.clientY > dragSpanPos.top
        && event.clientY < dragSpanPos.bottom) {
        return true;
      }
      return false;
    },
    isInViewport(element) {
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0
        && rect.left >= 0
        && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
        && rect.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    },
  },
};
</script>
